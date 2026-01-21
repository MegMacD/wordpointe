# Complete Setup Guide - End to End

This guide will walk you through setting up the database and getting the app running locally.

## Prerequisites

- Supabase account and project created
- Node.js installed (v18+)
- npm or yarn installed

## Step 1: Supabase Database Setup

### 1.1 Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### 1.2 Run Database Migrations

In Supabase SQL Editor, run these in order:

#### A. Main Schema
Run the contents of `supabase/migrations/000_main_schema.sql` (or copy from README.md schema section)

This creates:
- `users` table
- `memory_items` table
- `verse_records` table
- `spend_records` table
- `settings` table
- `user_points_summary` view

#### B. Improvements (Indexes, Triggers, Constraints)
Run the contents of `supabase/migrations/001_improvements.sql`

This adds:
- Performance indexes
- Unique constraints
- Auto-update triggers
- Promo metadata columns

#### C. Auth System
Run the contents of `supabase/migrations/001_auth_schema.sql`

This adds:
- `password_hash` and `role` columns to users
- `sessions` table
- Indexes for auth

### 1.3 Seed Initial Data

Run the contents of `supabase/seed.sql` (or create your own seed data)

This creates:
- Sample users (leaders and kids)
- Sample memory items (verses)
- Sample records and spends

## Step 2: Set Up Initial Users with Passwords

### 2.1 Generate Password Hashes

For each user you want to create, generate a password hash:

```bash
cd web
node scripts/generate-password-hash.js yourpassword
```

Copy the output hash (format: `salt:hash`).

### 2.2 Create Users in Supabase

In Supabase SQL Editor, for each user:

```sql
-- Create admin user
INSERT INTO users (name, is_leader, role, password_hash)
VALUES (
  'Admin',
  true,
  'admin',
  'paste-generated-hash-here'
);

-- Create leader user
INSERT INTO users (name, is_leader, role, password_hash)
VALUES (
  'Leader1',
  true,
  'leader',
  'paste-generated-hash-here'
);
```

**Important**: Generate a unique hash for each user's password!

## Step 3: Configure Next.js App

### 3.1 Create Environment File

In the `web/` directory, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3.2 Install Dependencies

```bash
cd web
npm install
```

## Step 4: Test the Setup

### 4.1 Start the Dev Server

```bash
cd web
npm run dev
```

The app should start at `http://localhost:3000`

### 4.2 Test Login

1. Go to `http://localhost:3000/login`
2. Enter a user name and password you created
3. You should be logged in and see your name in the nav bar

### 4.3 Test Core Features

#### Record a Memory
1. Go to `/record`
2. Search for or select a user
3. Select a memory item
4. Choose "first" or "repeat"
5. Click "Record Memory"
6. Should see success message with points awarded

#### Spend Points
1. Go to `/spend`
2. Select a user (should show current points)
3. Enter points to spend
4. Add optional note
5. Click "Spend Points"
6. Should see updated balance

#### View Users
1. Go to `/users`
2. Should see list of users with current points
3. Click on a user to see details

#### Admin Features (if logged in as admin)
1. Go to `/admin/memory-items`
2. Should see list of memory items
3. Can toggle active/inactive
4. Go to `/admin/settings` to view/edit default points
5. Go to `/admin/reports` to export current points

## Step 5: Troubleshooting

### "Unauthorized" errors
- Make sure you're logged in
- Check that user has `role` set in database
- Try logging out and back in

### "Invalid credentials" on login
- Verify user exists: `SELECT * FROM users WHERE name = 'YourName';`
- Check password hash is correct (regenerate if needed)
- Ensure user has `password_hash` set

### Database connection errors
- Verify `.env.local` has correct Supabase URL and keys
- Check Supabase project is active
- Verify service_role key is correct (not anon key)

### API route errors
- Check browser console for errors
- Check server terminal for error messages
- Verify all migrations ran successfully

### Missing data
- Verify seed SQL ran successfully
- Check tables have data: `SELECT * FROM users;`
- Ensure `user_points_summary` view exists

## Step 6: Verify Database State

Run these queries in Supabase to verify everything is set up:

```sql
-- Check users
SELECT id, name, is_leader, role FROM users;

-- Check memory items
SELECT id, reference, type, points_first, points_repeat, active FROM memory_items;

-- Check settings
SELECT * FROM settings;

-- Check view works
SELECT * FROM user_points_summary LIMIT 5;
```

## Next Steps

Once everything is working:
1. ✅ Create more users (leaders and kids)
2. ✅ Add more memory items (verses, custom items)
3. ✅ Start using the app for real data
4. ✅ Consider adding missing UI features (add user form, etc.)

## Getting Help

If you encounter issues:
1. Check the error message in browser console
2. Check server terminal output
3. Verify database state with SQL queries
4. Check that all migrations ran successfully
5. See `docs/ops-runbook.md` for more troubleshooting

