# User Creation Guide

## Overview

Word Pointe uses **invite-only authentication** - there is no public signup. Only administrators can create new leader or admin accounts.

## Security Model

- **No public signup** - prevents unauthorized access
- **Admin-only user creation** - maintains control over who has access
- **Password-based authentication** - simple and secure for small teams
- **Role-based access** - leaders and admins have different permissions

## Roles Explained

### Leader Role
- Can record verses for any child
- Can spend points for any child
- Can view and manage all users
- Can view help documentation
- **Cannot** access admin features

### Admin Role
- Has **all leader permissions** PLUS:
- Can manage memory items (verses)
- Can view all user records
- Can adjust/grant bonus points
- Can export reports
- Can change system settings

## How to Create a New User

### Step 1: Generate User Details

Run the user creation script:

```powershell
cd web
node scripts/create-user.js "User Name" password123 leader
# OR for admin:
node scripts/create-user.js "User Name" password123 admin
```

**Arguments:**
- **Name**: Full name (use quotes if it has spaces)
- **Password**: Password for login (minimum 6 characters)
- **Role**: Either `leader` or `admin`

**Examples:**
```powershell
# Create a leader
node scripts/create-user.js "Sarah Johnson" mypassword leader

# Create an admin
node scripts/create-user.js "John Smith" admin2024 admin
```

### Step 2: Run SQL in Supabase

The script will output SQL code. Follow these steps:

1. **Copy the SQL** from the script output
2. **Go to Supabase** → Your Project → **SQL Editor**
3. Click **"+ New query"**
4. **Paste the SQL** from the script
5. Click **"Run"**
6. **Verify** the user appears in the results

### Step 3: Test the Login

1. Go to your deployed app (or localhost)
2. Click Login
3. Enter the **name** and **password**
4. Verify they can access appropriate features

### Step 4: Secure the Password

⚠️ **Security Steps:**
- Share the password directly with the user (in person, encrypted message, etc.)
- Clear your terminal history
- Don't commit passwords to git
- Ask the user to change their password after first login (future feature)

## Quick Reference

### Create a Leader
```powershell
node scripts/create-user.js "Leader Name" secretpass leader
```

### Create an Admin  
```powershell
node scripts/create-user.js "Admin Name" adminpass admin
```

### Update Existing User's Password
If you need to reset someone's password:

```powershell
# Generate new hash
node scripts/generate-password-hash.js newpassword123
```

Then run in Supabase SQL Editor:
```sql
UPDATE users 
SET password_hash = 'hash-from-script', 
    updated_at = NOW()
WHERE name = 'User Name';
```

### Promote Leader to Admin
```sql
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE name = 'User Name';
```

### Demote Admin to Leader
```sql
UPDATE users 
SET role = 'leader',
    updated_at = NOW()
WHERE name = 'User Name';
```

## Troubleshooting

### "User already exists" Error
If the user name already exists, either:
- Choose a different name, OR
- Delete the existing user first:
  ```sql
  DELETE FROM users WHERE name = 'Existing Name';
  ```

### Login Fails After Creating User
1. Verify the user exists:
   ```sql
   SELECT name, role, password_hash FROM users WHERE name = 'User Name';
   ```
2. Check that `password_hash` is not NULL
3. Try regenerating the password hash and updating
4. Ensure name matching is exact (case-insensitive but spelling must match)

### Need to Disable a User
Instead of deleting, you can set their password to NULL:
```sql
UPDATE users SET password_hash = NULL WHERE name = 'User Name';
```

## Future Enhancements (Roadmap)

These features are planned for future releases:

- [ ] **Admin UI for user creation** - Create users from the web interface
- [ ] **Password reset functionality** - Users can reset their own passwords
- [ ] **First-login password change** - Force password change on first login
- [ ] **Email-based invites** - Send invitation emails to new users
- [ ] **Audit log** - Track when users are created, modified, or deleted
- [ ] **Session management** - View and revoke active sessions
- [ ] **Two-factor authentication** - Extra security for admin accounts
- [ ] **Password requirements** - Enforce strong passwords
- [ ] **Account lockout** - Lock accounts after failed login attempts

## Best Practices

✅ **Do:**
- Create users only when necessary
- Use strong, unique passwords
- Give users the minimum required role (leader vs admin)
- Keep a list of who has access
- Review active users periodically

❌ **Don't:**
- Share the same password across multiple users
- Create admin accounts unless truly needed
- Commit passwords or hashes to git
- Leave terminal output with passwords visible
- Create accounts for children or parents

## Support

If you need to create a user and encounter issues:
1. Check this guide's troubleshooting section
2. Verify the script runs without errors
3. Check Supabase SQL editor for specific error messages
4. Ensure your database migrations are up to date
