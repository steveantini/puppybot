import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  dateRange?: 'week' | 'month' | 'ytd' | 'all'
  includeContext?: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, dateRange = 'all', includeContext = true }: ChatRequest = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }

    // Pass the user's JWT so RLS policies apply
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    })

    // Fetch puppy profile (scoped to authenticated user via RLS)
    const { data: puppy } = await supabase
      .from('puppies')
      .select('*')
      .limit(1)
      .maybeSingle()

    // Fetch daily logs based on date range
    let query = supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false })

    if (dateRange !== 'all') {
      const today = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(today.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(today.getMonth() - 1)
          break
        case 'ytd':
          startDate = new Date(today.getFullYear(), 0, 1)
          break
      }
      
      query = query.gte('date', startDate.toISOString().split('T')[0])
    }

    const { data: logs } = await query

    const context = formatDataForClaude(logs || [], puppy)

    const systemPrompt = `You are PuppyBot Assistant, a helpful AI that analyzes puppy behavior data and provides insights.

${includeContext ? `PUPPY PROFILE:
Name: ${puppy?.name || 'Unknown'}
Breed: ${puppy?.breed || 'Unknown'}
Birthday: ${puppy?.birthday || 'Unknown'}

DAILY LOG DATA (${dateRange.toUpperCase()}):
${context}` : ''}

Guidelines:
- Be warm, friendly, and supportive with a caring tone
- Provide specific insights based on the data shown above
- Identify patterns and trends when visible in the data
- Offer practical training advice when relevant
- Keep responses concise but informative (2-4 paragraphs max)
- If data is insufficient for a specific question, say so clearly
- Use the puppy's name when appropriate
- Use emojis sparingly to make responses friendly
- When discussing statistics, cite specific numbers from the data
- Focus on actionable insights rather than just restating data`

    // Call Anthropic API directly via fetch (no SDK dependency issues)
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errBody)
      throw new Error(`Anthropic API returned ${anthropicResponse.status}: ${errBody}`)
    }

    const result = await anthropicResponse.json()
    const assistantMessage = result.content?.[0]?.text || 'No response generated.'

    return new Response(
      JSON.stringify({
        success: true,
        response: assistantMessage,
        usage: result.usage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function formatDataForClaude(logs: any[], _puppy: any): string {
  if (!logs || logs.length === 0) return 'No data available for the selected time range.'

  const formatted = logs.map((log) => {
    try {
      const pottyBreaks = log.potty_breaks || []
      const pottyDetails = pottyBreaks.map((p: any, i: number) => {
        const parts: string[] = []
        if (p.pee) parts.push(`Pee: ${p.pee}`)
        if (p.poop) parts.push(`Poop: ${p.poop}`)
        if (p.ringBell) parts.push('Bell: yes')
        if (p.notes) parts.push(`Note: ${p.notes}`)
        return `  ${i + 1}. ${p.time || '?'} — ${parts.join(', ') || 'no details'}`
      }).join('\n')

      const naps = log.naps || []
      const napDetails = naps.map((n: any, i: number) => {
        return `  ${i + 1}. ${n.startTime || '?'} – ${n.endTime || '?'}${n.notes ? ` (${n.notes})` : ''}`
      }).join('\n')

      const meals = log.meals || []
      const mealDetails = meals.map((m: any, i: number) => {
        const parts: string[] = []
        if (m.foodGiven) parts.push(`given: ${m.foodGiven} cup`)
        if (m.foodEaten) parts.push(`eaten: ${m.foodEaten} cup`)
        if (m.notes) parts.push(`note: ${m.notes}`)
        return `  ${i + 1}. ${m.time || '?'} — ${parts.join(', ') || 'no details'}`
      }).join('\n')

      const treats = log.snacks || 0
      const treatCalories = treats * 4

      const wakeTimesStr = (log.wake_up_times || [])
        .map((w: any) => `${w.time} (${w.type})`)
        .join(', ')

      let entry = `📅 ${log.date}\n`
      entry += `⏰ Wake: ${wakeTimesStr || 'Not logged'} | Bed: ${log.bed_time || 'Not logged'}\n`
      entry += `🚽 Potty Breaks (${pottyBreaks.length}):\n${pottyDetails || '  None logged'}\n`
      entry += `🍽️ Meals (${meals.length}):\n${mealDetails || '  None logged'}\n`
      entry += `🦴 Treats: ${treats} (${treatCalories} cal)\n`
      entry += `😴 Naps (${naps.length}):\n${napDetails || '  None logged'}\n`
      entry += `💪 Skills: ${log.skills || 'None logged'}\n`
      entry += `📝 Notes: ${log.notes || 'None'}`
      return entry
    } catch {
      return `📅 ${log.date} — (error formatting this entry)`
    }
  }).join('\n\n')

  return formatted
}

function parseFraction(str: string): number {
  if (!str) return 0
  if (str.includes('/')) {
    const [num, denom] = str.split('/').map(Number)
    return denom ? num / denom : num
  }
  return Number(str) || 0
}
