import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.20.0'

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, dateRange = 'all', includeContext = true }: ChatRequest = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch puppy profile
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

    // Apply date filters
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

    const { data: logs, error } = await query

    if (error) throw error

    // Format data for Claude
    const context = formatDataForClaude(logs || [], puppy)

    // Initialize Anthropic
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    })

    // Create system prompt with data context
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

    // Call Claude API with prompt caching
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    })

    // Save to chat history
    await supabase.from('chat_history').insert({
      message,
      role: 'user',
      date_range: dateRange,
    })

    await supabase.from('chat_history').insert({
      message: response.content[0].text,
      role: 'assistant',
      date_range: dateRange,
    })

    return new Response(
      JSON.stringify({
        success: true,
        response: response.content[0].text,
        usage: response.usage,
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

// Helper function to format logs for Claude
function formatDataForClaude(logs: any[], puppy: any): string {
  if (!logs || logs.length === 0) return 'No data available for the selected time range.'

  const formatted = logs.map((log) => {
    // Calculate potty stats
    const pottyBreaks = log.potty_breaks || []
    const pottyTotal = pottyBreaks.length
    const accidents = pottyBreaks.filter((p: any) => 
      p.peeStatus === 'accident' || p.poopStatus === 'accident'
    ).length
    const successRate = pottyTotal > 0 ? Math.round(((pottyTotal - accidents) / pottyTotal) * 100) : 0
    
    // Calculate nap duration
    const naps = log.naps || []
    const napDuration = naps.reduce((total: number, nap: any) => {
      const start = new Date(nap.startTime)
      const end = new Date(nap.endTime)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

    // Calculate calories
    const meals = log.meals || []
    const foodCalories = meals.reduce((sum: number, meal: any) => {
      const eaten = parseFraction(meal.foodEaten)
      const given = parseFraction(meal.foodGiven)
      return sum + (eaten / given * 367)
    }, 0)
    const snackCalories = (log.snacks || 0) * 4
    const totalCalories = foodCalories + snackCalories

    // Wake times
    const wakeTimesStr = (log.wake_up_times || [])
      .map((w: any) => `${w.time} (${w.type})`)
      .join(', ')

    return `📅 ${log.date}
⏰ Wake: ${wakeTimesStr || 'Not logged'} | Bed: ${log.bed_time || 'Not logged'}
🚽 Potty: ${pottyTotal} times, ${accidents} accidents (${successRate}% success)
🍽️ Meals: ${meals.length} meals | Calories: ${Math.round(totalCalories)} (${Math.round(foodCalories)} food + ${snackCalories} snacks)
😴 Naps: ${naps.length} naps, ${Math.round(napDuration)} minutes total
💪 Skills practiced: ${log.skills || 'None logged'}
📝 Notes: ${log.notes || 'None'}`
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
