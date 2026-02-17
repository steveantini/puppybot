-- ============================================================
-- PuppyBot Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Puppies table
CREATE TABLE puppies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  breed text,
  birthday date,
  breeder_name text,
  gotcha_day date,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Weight logs (one row per weigh-in)
CREATE TABLE weight_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id uuid REFERENCES puppies(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Daily logs (one row per day, arrays stored as JSONB)
CREATE TABLE daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  wake_up_times jsonb DEFAULT '[]'::jsonb,
  bed_time text,
  potty_breaks jsonb DEFAULT '[]'::jsonb,
  naps jsonb DEFAULT '[]'::jsonb,
  meals jsonb DEFAULT '[]'::jsonb,
  snacks integer DEFAULT 0,
  skills text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health records (immunizations, vet visits, medications)
CREATE TABLE health_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  date date NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS with permissive policies (no auth required for now)
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on puppies" ON puppies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on weight_logs" ON weight_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on daily_logs" ON daily_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on health_records" ON health_records
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for faster lookups
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
CREATE INDEX idx_health_records_date ON health_records(date);
CREATE INDEX idx_weight_logs_puppy_date ON weight_logs(puppy_id, date);

-- Chat history (for AI assistant conversations)
CREATE TABLE chat_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  date_range text,
  created_at timestamptz DEFAULT now()
);

-- Weekly insights (AI-generated summaries)
CREATE TABLE weekly_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  insight text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for chat tables
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on chat_history" ON chat_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on weekly_insights" ON weekly_insights
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for chat tables
CREATE INDEX idx_chat_history_created ON chat_history(created_at);
CREATE INDEX idx_weekly_insights_week ON weekly_insights(week_start);

-- ============================================================
-- Migration: Add snacks column to daily_logs
-- Run this if the table already exists:
--   ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS snacks integer DEFAULT 0;
--
-- Migration: Add chat tables
-- Run these if upgrading an existing database:
--   (Copy the chat_history and weekly_insights table creation statements above)
--
-- Migration: Add breeder_name and gotcha_day to puppies table
-- Run these if the puppies table already exists:
--   ALTER TABLE puppies ADD COLUMN IF NOT EXISTS breeder_name text;
--   ALTER TABLE puppies ADD COLUMN IF NOT EXISTS gotcha_day date;
-- ============================================================
