# Authentication Setup - Quick Summary

## What Changed

Your app now has a two-tier authentication system:
- **Leader**: Can use the app (record, spend, view users)
- **Admin**: Can do everything leaders can, plus manage items, settings, and reports

## Steps to Complete Setup

### 1. Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Copy and paste the contents of: supabase/migrations/001_auth_schema.sql
```

This adds:
- `password_hash` and `role` columns to `users` table
- `sessions` table for tracking logins
- Indexes for performance

### 2. Generate Password Hashes

For each user you want to set up, generate a password hash:

```bash
cd web
node scripts/generate-password-hash.js yourpassword
```

Copy the hash that's output (format: `salt:hash`).

### 3. Update Users in Database

For each user, run in Supabase SQL Editor:

```sql
-- For an admin user
UPDATE users 
SET password_hash = 'paste-generated-hash-here', 
    role = 'admin'
WHERE name = 'YourUserName';

-- For a leader user
UPDATE users 
SET password_hash = 'paste-generated-hash-here', 
    role = 'leader'
WHERE name = 'YourUserName';
```

Or create new users:

```sql
INSERT INTO users (name, is_leader, role, password_hash)
VALUES (
  'Admin',
  true,
  'admin',
  'paste-generated-hash-here'
);
```

### 4. Test Login

1. Start your dev server: `npm run dev`
2. Go to `/login`
3. Enter your name and password
4. You should be logged in and see your name in the nav bar

### 5. Create Additional Users

Once logged in as admin:
- Go to Users page
- Create new users (they'll need passwords set via SQL - see step 3)

## What's Protected

- **All pages** now require login (redirects to `/login` if not authenticated)
- **Admin pages** (Memory Items, Settings, Reports) require admin role
- **API routes** check authentication and roles
- **Kids** cannot access the app without a leader login

## Files Created/Modified

- `supabase/migrations/001_auth_schema.sql` - Database migration
- `web/src/lib/auth-server.ts` - Server-side auth utilities
- `web/src/lib/password.ts` - Password hashing
- `web/src/app/api/auth/*` - Login/logout/check endpoints
- `web/src/components/AuthGuard.tsx` - Page protection wrapper
- `web/scripts/generate-password-hash.js` - Password hash generator
- `docs/auth-setup.md` - Complete documentation

## Troubleshooting

**"Invalid credentials"**
- Check user exists: `SELECT * FROM users WHERE name = 'YourName';`
- Verify password hash matches (regenerate if needed)
- Check user has `role` set: `SELECT name, role FROM users;`

**"Unauthorized" on API calls**
- Make sure you're logged in (check browser cookies)
- Try logging out and back in

**Can't see admin pages**
- Check your role: `SELECT role FROM users WHERE name = 'YourName';`
- Should be 'admin', not 'leader'

## Next Steps

After setup works:
1. Create leader accounts for all your leaders
2. Test that leaders can't access admin pages
3. Test that logout works and prevents access
4. Consider adding a "change password" feature later

