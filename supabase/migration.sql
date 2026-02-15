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
