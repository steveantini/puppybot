import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.20.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the start of current week (Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - daysToMonday - 7) // Last week
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // Fetch puppy profile
    const { data: puppy } = await supabase
      .from('puppy_profile')
      .select('*')
      .single()

    // Fetch last week's data
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    if (!logs || logs.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No data for last week',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format data summary
    const summary = generateWeeklySummary(logs)

    // Initialize Anthropic
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    })

    // Generate insights with Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: `You are PuppyBot Assistant generating a weekly summary for ${puppy?.name || 'a puppy'}.

Create a comprehensive yet friendly weekly report covering:
1. Overall progress and highlights
2. Potty training trends
3. Sleep patterns and quality
4. Eating habits and nutrition
5. Notable achievements or concerns
6. Recommendations for the coming week

Use a warm, encouraging tone. Include specific metrics from the data. Format with headers and bullet points for readability.`,
      messages: [
        {
          role: 'user',
          content: `Generate a weekly insight report for week of ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}:\n\n${summary}`,
        },
      ],
    })

    const insight = response.content[0].text

    // Save to database
    const { error: insertError } = await supabase
      .from('weekly_insights')
      .insert({
        week_start: weekStart.toISOString().split('T')[0],
        insight,
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        success: true,
        insight,
        week_start: weekStart.toISOString().split('T')[0],
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

function generateWeeklySummary(logs: any[]): string {
  let totalPotty = 0
  let totalAccidents = 0
  let totalNapMinutes = 0
  let totalCalories = 0
  let totalMeals = 0
  let daysLogged = logs.length

  logs.forEach((log) => {
    const pottyBreaks = log.potty_breaks || []
    totalPotty += pottyBreaks.length
    totalAccidents += pottyBreaks.filter((p: any) => 
      p.peeStatus === 'accident' || p.poopStatus === 'accident'
    ).length

    const naps = log.naps || []
    totalNapMinutes += naps.reduce((total: number, nap: any) => {
      const start = new Date(nap.startTime)
      const end = new Date(nap.endTime)
      return total + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

    const meals = log.meals || []
    totalMeals += meals.length
    totalCalories += meals.reduce((sum: number, meal: any) => {
      const eaten = parseFraction(meal.foodEaten)
      const given = parseFraction(meal.foodGiven)
      return sum + (eaten / given * 367)
    }, 0) + ((log.snacks || 0) * 4)
  })

  const successRate = totalPotty > 0 ? Math.round(((totalPotty - totalAccidents) / totalPotty) * 100) : 0
  const avgCaloriesPerDay = Math.round(totalCalories / daysLogged)
  const avgNapMinutesPerDay = Math.round(totalNapMinutes / daysLogged)

  return `WEEKLY SUMMARY (${daysLogged} days logged):

🚽 POTTY TRAINING:
- Total potty breaks: ${totalPotty}
- Accidents: ${totalAccidents}
- Success rate: ${successRate}%
- Average per day: ${Math.round(totalPotty / daysLogged)}

😴 SLEEP:
- Total nap time: ${Math.round(totalNapMinutes / 60)} hours
- Average per day: ${avgNapMinutesPerDay} minutes

🍽️ NUTRITION:
- Total meals: ${totalMeals}
- Total calories: ${totalCalories}
- Average per day: ${avgCaloriesPerDay} calories

📝 DAILY DETAILS:
${logs.map((log) => {
  const potty = (log.potty_breaks || []).length
  const accidents = (log.potty_breaks || []).filter((p: any) => 
    p.peeStatus === 'accident' || p.poopStatus === 'accident'
  ).length
  return `${log.date}: ${potty} potty (${accidents} acc), ${log.meals?.length || 0} meals, ${log.notes ? '✓ notes' : ''}`
}).join('\n')}`
}

function parseFraction(str: string): number {
  if (!str) return 0
  if (str.includes('/')) {
    const [num, denom] = str.split('/').map(Number)
    return denom ? num / denom : num
  }
  return Number(str) || 0
}
