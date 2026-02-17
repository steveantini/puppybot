# Database Migration Guide

This guide will help you migrate your PuppyBot database to support multi-user authentication and family sharing.

## ⚠️ Important: Backup Your Data First!

Before running any migrations, **backup your existing data**:

1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup or export your data

---

## Step 1: Run the Authentication Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/zauwklyztvdexzyrbmrd/sql/new

2. Copy the entire contents of `/supabase/migrations/001_auth_and_multi_user.sql`

3. Paste into the SQL Editor

4. Click **"Run"**

5. You should see: ✅ "Success" messages

### Option B: Via Supabase CLI

```bash
cd /Users/stevenantini/Projects/PuppyBot
npx supabase db push
```

---

## Step 2: Migrate Existing Data

Since you have existing puppies and logs, you need to assign them to a user.

### 2.1 Create Your First User

**Via Signup Page**:
1. Go to https://puppybot.vercel.app/signup
2. Create your account
3. Note your email address

**Or via Supabase Dashboard**:
1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and password

### 2.2 Link Existing Data to Your User

Run this SQL in Supabase SQL Editor (replace `your-email@example.com` with your actual email):

```sql
-- Get your user ID
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Please create an account first.';
  END IF;
  
  -- Update all existing puppies
  UPDATE puppies 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Update weight logs
  UPDATE weight_logs 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Update daily logs
  UPDATE daily_logs 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Update health records
  UPDATE health_records 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Update chat history
  UPDATE chat_history 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Update weekly insights
  UPDATE weekly_insights 
  SET user_id = v_user_id 
  WHERE user_id IS NULL;
  
  -- Create owner record for first puppy
  INSERT INTO puppy_members (puppy_id, user_id, role, invited_by, accepted_at)
  SELECT id, v_user_id, 'owner', v_user_id, now()
  FROM puppies
  WHERE user_id = v_user_id
  LIMIT 1;
  
  RAISE NOTICE 'Migration complete! All data assigned to user: %', v_user_id;
END $$;
```

---

## Step 3: Verify the Migration

### 3.1 Test Authentication

1. Log out (if logged in)
2. Go to https://puppybot.vercel.app/login
3. Sign in with your credentials
4. You should see your puppy data

### 3.2 Check Data Visibility

Run this query to verify RLS is working:

```sql
-- This should return YOUR puppies only
SELECT p.name, p.breed, pm.role
FROM puppies p
LEFT JOIN puppy_members pm ON p.id = pm.puppy_id AND pm.user_id = auth.uid()
WHERE p.user_id = auth.uid() OR pm.user_id IS NOT NULL;
```

---

## Step 4: Test Multi-User Features

### 4.1 Create a Second User (Optional Testing)

1. Open an incognito/private browser window
2. Go to https://puppybot.vercel.app/signup
3. Create a second account
4. Verify you DON'T see the first user's puppies

### 4.2 Test Family Sharing (Coming Soon)

Once the sharing UI is built, you'll be able to invite family members to view your puppy.

---

## Common Issues & Solutions

### Issue: "Row Level Security policy violation"

**Solution**: Your data doesn't have `user_id` set. Run Step 2.2 again.

### Issue: "User not found"

**Solution**: 
1. Make sure you created an account first (Step 2.1)
2. Use the exact email address you signed up with
3. Check auth.users table: `SELECT email FROM auth.users;`

### Issue: "Cannot insert into table (RLS)"

**Solution**: The `user_id` must match your current auth user.
```sql
-- Check your current user ID
SELECT auth.uid();

-- Update the insert to use auth.uid()
-- Example: INSERT INTO puppies (user_id, name) VALUES (auth.uid(), 'Max');
```

### Issue: Existing puppy not showing up

**Solution**: 
```sql
-- Find puppies without user_id
SELECT * FROM puppies WHERE user_id IS NULL;

-- Assign them to yourself
UPDATE puppies SET user_id = auth.uid() WHERE user_id IS NULL;
```

---

## Rollback (Emergency Only)

If something goes wrong and you need to rollback:

```sql
-- Disable RLS (temporary)
ALTER TABLE puppies DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights DISABLE ROW LEVEL SECURITY;

-- Remove user_id columns (WARNING: This loses user associations!)
-- ALTER TABLE puppies DROP COLUMN user_id;
-- (repeat for all tables)

-- Drop new tables
-- DROP TABLE IF EXISTS puppy_invites CASCADE;
-- DROP TABLE IF EXISTS puppy_members CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
```

**⚠️ Only do this if you need to revert completely. You'll lose all user associations.**

---

## Next Steps After Migration

1. ✅ Authentication is now required
2. ✅ Your data is protected by RLS
3. ⏭️ Admin panel (coming next)
4. ⏭️ Family sharing features (in development)
5. ⏭️ Multi-puppy support (in development)

---

## Support

If you encounter issues:
1. Check the Supabase Dashboard → Logs → Postgres Logs for errors
2. Review the migration SQL file for any missed steps
3. Ensure all tables have the `user_id` column
4. Verify RLS policies are enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

