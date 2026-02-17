# Quick Start: Setting Up Authentication

You've successfully run the database migration! Now follow these steps to activate authentication and multi-user features.

## 🚀 Step-by-Step Activation

### Step 1: Create Your Account

1. **Wait for Vercel to deploy** (1-2 minutes after the push)
2. Go to: https://puppybot.vercel.app/signup
3. **Sign up** with your email and password
4. You'll see a success message and be redirected to the dashboard

**Important**: Use the email address you want to manage PuppyBot with!

---

### Step 2: Migrate Your Existing Data

Your existing puppy (Arlo) and all his data needs to be assigned to your new user account.

**Run this SQL in Supabase** (replace `your-email@example.com` with the email you just signed up with):

Go to: https://supabase.com/dashboard/project/zauwklyztvdexzyrbmrd/sql/new

```sql
-- Assign all existing data to your user account
DO $$
DECLARE
  v_user_id uuid;
  v_puppy_id uuid;
BEGIN
  -- Find your user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Make sure you created an account first!';
  END IF;
  
  -- Update all existing puppies
  UPDATE puppies 
  SET user_id = v_user_id 
  WHERE user_id IS NULL
  RETURNING id INTO v_puppy_id;
  
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
  
  -- Create owner record in puppy_members for first puppy
  INSERT INTO puppy_members (puppy_id, user_id, role, invited_by, accepted_at)
  SELECT id, v_user_id, 'owner', v_user_id, now()
  FROM puppies
  WHERE user_id = v_user_id
  ON CONFLICT (puppy_id, user_id) DO NOTHING;
  
  RAISE NOTICE 'SUCCESS! All data has been assigned to your user account.';
END $$;
```

Click **"Run"** and you should see: ✅ "SUCCESS! All data has been assigned to your user account."

---

### Step 3: Test Everything

1. **Log in**: https://puppybot.vercel.app/login
2. **Check your data**: You should see all of Arlo's existing data
3. **Open admin menu**: Click the hamburger menu (☰) next to Arlo's avatar
4. **Explore settings**:
   - Account Settings - Update your name, change password
   - My Puppies - See Arlo listed
   - Family & Sharing - Invite family members!

---

## 🎉 What's Now Available

### ✅ Authentication
- Secure login with email/password
- Session management
- Sign out functionality

### ✅ Admin Panel  
- Hamburger menu (☰) in top-right
- Account settings (profile, password change)
- Puppy management (view all, add new, edit, delete)
- Family & sharing (invite members, manage access)

### ✅ Family Sharing
- Invite family members by email
- 3 access levels:
  - **Owner**: Full control
  - **Editor**: Can log data
  - **Viewer**: Read-only (perfect for vets!)
- Manage members and pending invitations

### ✅ Multi-Puppy Support
- Add unlimited puppies
- Switch between puppies
- Each puppy can have its own shared members

---

## 👥 How to Share with Family or Vets

### Option 1: Invite via Email

1. Open **Admin Menu** (☰) → **Family & Sharing**
2. Select which puppy to share
3. Click **"Invite"**
4. Enter their email address
5. Choose access level:
   - **Viewer** for vets/trainers (read-only)
   - **Editor** for family who will log data
6. Click **"Send Invite"**

They'll receive an email (coming soon) or you can share the app link with them and they'll see the invite when they sign up with that email.

### Option 2: Have Them Sign Up First

1. They create an account at: https://puppybot.vercel.app/signup
2. You invite them using the email they signed up with
3. They'll see the puppy in their "My Puppies" list

---

## 🔒 Security Features Active

- ✅ Row Level Security (RLS) - Users can only see their own data
- ✅ Encrypted passwords via Supabase Auth
- ✅ Secure sessions with auto token refresh
- ✅ Role-based access control for shared puppies
- ✅ HTTPS enforced on all connections (via Vercel)

---

## 🐛 Troubleshooting

### "I don't see my puppy data after logging in"

**Solution**: Run the Step 2 migration SQL to assign your existing data to your account.

### "Login page doesn't appear"

**Solution**: Clear your browser cache or use incognito mode, then visit https://puppybot.vercel.app/login

### "Row Level Security policy violation"

**Solution**: Make sure you ran the Step 2 data migration. Check that your puppies have a `user_id` set:

```sql
SELECT id, name, user_id FROM puppies;
```

If `user_id` is NULL, run the Step 2 migration again.

### "Can't invite family members"

**Solution**: Make sure you're on the "Family & Sharing" page and have at least one puppy. Only owners can send invites.

---

## ⏭️ What's Next

After testing these features, we can add:
- Email notifications for invites
- Two-factor authentication (2FA)
- Premium subscriptions with Stripe
- More admin panel features (security, notifications, preferences)

---

**Need help?** Check the console for errors or review the MIGRATION_GUIDE.md for more detailed troubleshooting.
