# Authentication Setup Guide

The app now uses a simple two-tier authentication system:
- **Leader**: Can record memories, spend points, view users
- **Admin**: Can do everything leaders can, plus manage memory items, settings, and reports

## Database Setup

### 1. Run the Auth Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/001_auth_schema.sql
-- (See that file for the complete migration)
```

This will:
- Add `password_hash` and `role` columns to `users` table
- Create a `sessions` table for tracking logins
- Add indexes for performance

### 2. Set Up Initial Users

#### Option A: Use the Node.js Script (Recommended)

1. Generate password hashes:
   ```bash
   cd web
   node scripts/generate-password-hash.js admin123
   ```

2. Copy the hash output and update your users in Supabase SQL Editor:
   ```sql
   -- Update existing user or create new one
   UPDATE users 
   SET password_hash = 'salt:hash', role = 'admin'
   WHERE name = 'Admin';
   
   -- Or create new user
   INSERT INTO users (name, is_leader, role, password_hash)
   VALUES ('Leader1', true, 'leader', 'salt:hash');
   ```

#### Option B: Manual SQL

For each user you want to set up:

```sql
-- Admin user
UPDATE users 
SET password_hash = 'your-generated-hash-here', 
    role = 'admin'
WHERE name = 'YourAdminName';

-- Leader user
UPDATE users 
SET password_hash = 'your-generated-hash-here', 
    role = 'leader'
WHERE name = 'YourLeaderName';
```

**Important**: You must generate the password hash using the Node.js script. The hash format is `salt:hash` where both are hex strings.

## Creating Users

### Via SQL (for initial setup)

```sql
-- Create admin
INSERT INTO users (name, is_leader, role, password_hash)
VALUES (
  'Admin',
  true,
  'admin',
  'generated-hash-here'  -- Use the Node.js script!
);

-- Create leader
INSERT INTO users (name, is_leader, role, password_hash)
VALUES (
  'Leader1',
  true,
  'leader',
  'generated-hash-here'  -- Use the Node.js script!
);
```

### Via App (after first admin login)

Once you have an admin user set up:
1. Log in as admin
2. Go to Users page
3. Create new users (they'll need passwords set via SQL initially, or you can add a "set password" feature later)

## Password Security

- Passwords are hashed using SHA-256 with a random salt
- For production, consider upgrading to bcrypt or argon2
- Each user must have a unique name (used as login identifier)
- Store passwords securely - never commit them to git

## Session Management

- Sessions are stored in the `sessions` table
- Sessions expire after 7 days
- Logout clears the session
- Sessions are tied to HTTP-only cookies (secure in production)

## Role Permissions

### Leader
- ✅ Record memories
- ✅ Spend points
- ✅ View users and points
- ✅ Undo spend records
- ❌ Manage memory items
- ❌ Change settings
- ❌ View reports

### Admin
- ✅ Everything a leader can do
- ✅ Manage memory items (create, update, activate/deactivate)
- ✅ Change default point settings
- ✅ View and export reports
- ✅ Create/update users

## Troubleshooting

### "Invalid credentials" error
- Check that the user exists in the database
- Verify the password hash matches (use the script to regenerate if needed)
- Ensure the user has a `role` set ('leader' or 'admin')

### "Unauthorized" error on API calls
- Check that you're logged in (session cookie exists)
- Verify your role has permission for the action
- Try logging out and back in

### Can't see admin pages
- Check that your user has `role = 'admin'` in the database
- Clear browser cookies and log in again

## Next Steps

After initial setup:
1. Log in as admin
2. Create additional leader users as needed
3. Consider adding a "change password" feature
4. For production, consider:
   - Rate limiting on login attempts
   - Password strength requirements
   - Email verification (future enhancement)

