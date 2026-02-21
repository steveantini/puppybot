-- ============================================================
-- Migration 005: Security Fixes
-- 1. Drop permissive "Allow all" RLS policies
-- 2. Fix daily_logs UNIQUE constraint for multi-user
-- 3. Fix puppy_members RLS to include puppy owner
-- ============================================================

-- ─── 1. Drop overly permissive "Allow all" policies ─────────
DROP POLICY IF EXISTS "Allow all on puppies" ON puppies;
DROP POLICY IF EXISTS "Allow all on weight_logs" ON weight_logs;
DROP POLICY IF EXISTS "Allow all on daily_logs" ON daily_logs;
DROP POLICY IF EXISTS "Allow all on health_records" ON health_records;
DROP POLICY IF EXISTS "Allow all on chat_history" ON chat_history;
DROP POLICY IF EXISTS "Allow all on weekly_insights" ON weekly_insights;

-- ─── 2. Fix daily_logs UNIQUE constraint ─────────────────────
-- Old: UNIQUE(date) — causes cross-user overwrites
-- New: UNIQUE(user_id, date) — each user gets their own row per day
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_date_key;
ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_user_date_unique UNIQUE(user_id, date);

-- ─── 3. Fix puppy_members RLS to include the puppy owner ────
DROP POLICY IF EXISTS "Users can view members of their puppies" ON puppy_members;
DROP POLICY IF EXISTS "Owners can manage members" ON puppy_members;

CREATE POLICY "Users can view members of their puppies" ON puppy_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppy_members.puppy_id
      AND pm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM puppies
      WHERE puppies.id = puppy_members.puppy_id
      AND puppies.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage members" ON puppy_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppy_members.puppy_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM puppies
      WHERE puppies.id = puppy_members.puppy_id
      AND puppies.user_id = auth.uid()
    )
  );
