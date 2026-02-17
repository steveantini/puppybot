# AI Chat Assistant Setup Guide

This guide walks you through setting up the Claude-powered chat assistant for PuppyBot.

## Prerequisites

- Supabase project (already set up)
- Anthropic API account
- Supabase CLI installed

## Step-by-Step Setup

### 1. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to API Keys
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)
6. **Keep it secure** - never commit it to git

### 2. Install Supabase CLI

If you haven't already:

```bash
npm install supabase --save-dev
```

### 3. Link to Your Supabase Project

```bash
npx supabase link --project-ref zauwklyztvdexzyrbmrd
```

When prompted, enter your database password.

### 4. Deploy Edge Functions

Deploy both Edge Functions to Supabase:

```bash
# Deploy chat assistant
npx supabase functions deploy chat-assistant

# Deploy weekly insights generator
npx supabase functions deploy weekly-insights
```

You should see success messages for each deployment.

### 5. Set Secrets

Set your Anthropic API key as a secret in Supabase:

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**Important**: Replace `sk-ant-your-actual-key-here` with your real API key.

To verify your secrets:

```bash
npx supabase secrets list
```

### 6. Run Database Migration

Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  date_range text,
  created_at timestamptz DEFAULT now()
);

-- Weekly insights table
CREATE TABLE IF NOT EXISTS weekly_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  insight text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Permissive policies (no auth required)
CREATE POLICY "Allow all on chat_history" ON chat_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on weekly_insights" ON weekly_insights
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week_start);
```

Click "Run" to execute the migration.

### 7. Test the Chat Assistant

1. Open your PuppyBot app: [https://puppybot.vercel.app](https://puppybot.vercel.app)
2. Click the sparkle ✨ button in the bottom-right
3. Try asking: "How is potty training going?"
4. You should get a response from Claude analyzing your data

If you get an error:
- Check that the Edge Function deployed successfully
- Verify your API key is set correctly
- Check browser console for error messages
- Verify the migration ran successfully

## Testing Edge Functions Locally (Optional)

To test locally before deploying:

```bash
# Start local Supabase
npx supabase start

# Serve functions locally
npx supabase functions serve chat-assistant --env-file .env.local
```

Create `.env.local` with:

```
ANTHROPIC_API_KEY=sk-ant-your-key
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
```

## Usage Tips

### Ask Better Questions

Good questions get better answers:

- ✅ "How is potty training progress over the last week?"
- ✅ "Why might nap times be decreasing?"
- ✅ "Is the feeding schedule consistent?"
- ❌ "tell me stuff" (too vague)

### Use Time Ranges

Switch between Week/Month/YTD/All Time to focus the analysis:
- **Week**: Recent patterns and immediate concerns
- **Month**: Establish trends and progress
- **YTD**: Long-term behavioral changes
- **All Time**: Overall development arc

### Save Insights

Click "Save to notes" on helpful responses to preserve them in your daily log.

### Voice Input

Click the microphone 🎤 button to speak your question (Chrome/Edge/Safari).

## Cost Estimate

Claude 3.5 Sonnet pricing (as of Feb 2026):
- Input: $3 per million tokens
- Output: $15 per million tokens

With prompt caching (90% discount on cached context):
- Typical query: $0.01 - $0.03
- 100 queries/month: ~$1-3
- Heavy usage (500 queries/month): ~$5-15

## Weekly Insights (Optional)

To enable automated weekly summaries:

1. Go to Supabase Dashboard > Edge Functions
2. Click on `weekly-insights`
3. Set up a cron trigger for Monday 8:00 AM
4. Or call manually:

```bash
curl -X POST \
  https://zauwklyztvdexzyrbmrd.supabase.co/functions/v1/weekly-insights \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Troubleshooting

### "Error calling Edge Function"

1. Check function logs in Supabase Dashboard
2. Verify API key is set: `npx supabase secrets list`
3. Ensure functions are deployed: check Supabase Dashboard > Edge Functions

### "API key not found"

Run: `npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`

### Chat button doesn't appear

1. Clear browser cache
2. Check browser console for errors
3. Verify you're on the Dashboard page

### Slow responses

- First query is always slower (building context)
- Subsequent queries within 5 minutes use cached context (much faster)
- Large date ranges take longer to analyze

## Support

For issues:
1. Check Supabase Edge Function logs
2. Check browser console
3. Verify all setup steps completed
4. Check Anthropic API status: [status.anthropic.com](https://status.anthropic.com)
