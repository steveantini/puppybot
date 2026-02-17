-- ============================================================
-- Migration 001: Authentication & Multi-User Support
-- This migration adds authentication, user profiles, multi-puppy support,
-- and family sharing capabilities
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- UPDATE EXISTING TABLES WITH USER_ID
-- ============================================================

-- Add user_id to puppies table
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_puppies_user_id ON puppies(user_id);

-- Add user_id to weight_logs table
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);

-- Add user_id to daily_logs table
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);

-- Add user_id to health_records table
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);

-- Add user_id to chat_history table
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Add user_id to weekly_insights table
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id);

-- ============================================================
-- PUPPY MEMBERS (for family sharing)
-- ============================================================

CREATE TABLE IF NOT EXISTS puppy_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id uuid REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(puppy_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_puppy_members_puppy ON puppy_members(puppy_id);
CREATE INDEX IF NOT EXISTS idx_puppy_members_user ON puppy_members(user_id);

-- Enable RLS
ALTER TABLE puppy_members ENABLE ROW LEVEL SECURITY;

-- Policies: Users can see members of puppies they have access to
CREATE POLICY "Users can view members of their puppies" ON puppy_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppy_members.puppy_id
      AND pm.user_id = auth.uid()
    )
  );

-- Owners can manage members
CREATE POLICY "Owners can manage members" ON puppy_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppy_members.puppy_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  );

-- ============================================================
-- PUPPY INVITATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS puppy_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  puppy_id uuid REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_email text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puppy_invites_token ON puppy_invites(token);
CREATE INDEX IF NOT EXISTS idx_puppy_invites_email ON puppy_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_puppy_invites_puppy ON puppy_invites(puppy_id);

-- Enable RLS
ALTER TABLE puppy_invites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view invites they sent" ON puppy_invites
  FOR SELECT USING (inviter_id = auth.uid());

CREATE POLICY "Users can view invites sent to them" ON puppy_invites
  FOR SELECT USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create invites for their puppies" ON puppy_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppy_invites.puppy_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'editor')
    )
  );

-- ============================================================
-- ROW LEVEL SECURITY POLICIES FOR EXISTING TABLES
-- ============================================================

-- PUPPIES: Users can see puppies they own or are members of
CREATE POLICY "Users can view accessible puppies" ON puppies
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppies.id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own puppies" ON puppies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own puppies" ON puppies
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppies.id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can delete puppies" ON puppies
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM puppy_members pm
      WHERE pm.puppy_id = puppies.id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  );

-- WEIGHT LOGS: Inherit access from puppy
CREATE POLICY "Users can view weight logs for accessible puppies" ON weight_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM puppies p
      JOIN puppy_members pm ON p.id = pm.puppy_id
      WHERE weight_logs.puppy_id = p.id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage weight logs for editable puppies" ON weight_logs
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM puppies p
      JOIN puppy_members pm ON p.id = pm.puppy_id
      WHERE weight_logs.puppy_id = p.id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('owner', 'editor')
    )
  );

-- DAILY LOGS: Users can see/edit logs they created or for shared puppies
CREATE POLICY "Users can view own daily logs" ON daily_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own daily logs" ON daily_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own daily logs" ON daily_logs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own daily logs" ON daily_logs
  FOR DELETE USING (user_id = auth.uid());

-- HEALTH RECORDS: Users can see/edit records they created or for shared puppies
CREATE POLICY "Users can view own health records" ON health_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own health records" ON health_records
  FOR ALL USING (user_id = auth.uid());

-- CHAT HISTORY: Users can only see their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own chat history" ON chat_history
  FOR ALL USING (user_id = auth.uid());

-- WEEKLY INSIGHTS: Users can only see their own insights
CREATE POLICY "Users can view own insights" ON weekly_insights
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own insights" ON weekly_insights
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if user has access to a puppy
CREATE OR REPLACE FUNCTION public.user_has_puppy_access(
  p_puppy_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM puppies
    WHERE id = p_puppy_id
    AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM puppy_members
    WHERE puppy_id = p_puppy_id
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role for a puppy
CREATE OR REPLACE FUNCTION public.get_user_puppy_role(
  p_puppy_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS text AS $$
BEGIN
  -- Check if user is the owner
  IF EXISTS (SELECT 1 FROM puppies WHERE id = p_puppy_id AND user_id = p_user_id) THEN
    RETURN 'owner';
  END IF;
  
  -- Check puppy_members for role
  RETURN (
    SELECT role FROM puppy_members
    WHERE puppy_id = p_puppy_id
    AND user_id = p_user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- AUDIT LOG (optional but recommended)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- NOTES
-- ============================================================

-- After running this migration:
-- 1. Existing data will need user_id populated (manually or via script)
-- 2. Create first user via Supabase dashboard or signup flow
-- 3. Update existing puppies/logs to assign to that user
-- 4. Test RLS policies thoroughly before deploying

-- Migration rollback (if needed):
-- DROP POLICY IF EXISTS ... (for each policy)
-- DROP TABLE IF EXISTS audit_logs, puppy_invites, puppy_members CASCADE;
-- ALTER TABLE puppies DROP COLUMN IF EXISTS user_id;
-- (etc. for all tables)
