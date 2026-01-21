# Quick Start Guide

Get up and running in 15 minutes!

## 1. Database Setup (5 min)

### In Supabase SQL Editor, run these in order:

1. **Main Schema**: Copy/paste contents of `supabase/migrations/000_main_schema.sql`
2. **Improvements**: Copy/paste contents of `supabase/migrations/001_improvements.sql`
3. **Bible Version**: Copy/paste contents of `supabase/migrations/002_bible_version.sql`
4. **Auto Import Fields**: Copy/paste contents of `supabase/migrations/003_auto_import_fields.sql`
5. **Auth**: Copy/paste contents of `supabase/migrations/001_auth_schema.sql`
6. **Seed Data**: Copy/paste contents of `supabase/seed.sql`
7. **Common Verses** (Optional): Copy/paste `supabase/seed_common_verses.sql` for 47 pre-loaded verses

## 2. Create Your First User (2 min)

### Generate Password Hash
```bash
cd web
node scripts/generate-password-hash.js mypassword123
```

Copy the hash output (looks like: `abc123:def456...`)

### Create Admin User in Supabase SQL Editor
```sql
UPDATE users 
SET password_hash = 'paste-your-hash-here', 
    role = 'admin'
WHERE name = 'Alice Leader';

-- Or create new admin
INSERT INTO users (name, is_leader, role, password_hash)
VALUES ('Admin', true, 'admin', 'paste-your-hash-here');
```

## 3. Configure App (2 min)

### Create `.env.local` in `web/` folder:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from Supabase Dashboard → Settings → API

### Install Dependencies
```bash
cd web
npm install
```

## 4. Start App (1 min)

```bash
npm run dev
```

Open `http://localhost:3000`

## 5. Login (1 min)

1. Go to `/login`
2. Enter the user name you created (e.g., "Alice Leader" or "Admin")
3. Enter the password you hashed
4. You should be logged in!

## 6. Test It (4 min)

### Try Core Features:
- ✅ **Record a memory**: `/record` - Try adding a new verse like "Philippians 4:13"
- ✅ **View verse in different translations**: Select a verse and use the version dropdown
- ✅ **Spend points**: `/spend`
- ✅ **View users**: `/users`
- ✅ **Admin features**: `/admin/memory-items`, `/admin/settings`, `/admin/reports`

### Test Bible Verse Features:
1. Go to `/record`
2. Click "+ Enter New Verse Reference"
3. Type "Romans 8:28" (or any verse)
4. Notice autocomplete suggestions as you type
5. Submit the form - verse text is fetched automatically!
6. View the verse in different translations using the dropdown

For comprehensive testing, see `USER_ACCEPTANCE_TESTING.md`

## Troubleshooting

**"Invalid credentials"**
- User exists? `SELECT name FROM users WHERE name = 'YourName';`
- Has password? `SELECT name, password_hash IS NOT NULL FROM users;`
- Regenerate hash and try again

**"Unauthorized"**
- Check user has role: `SELECT name, role FROM users;`
- Try logging out and back in

**Database errors**
- Verify all 4 SQL files ran successfully
- Check tables exist: `SELECT * FROM users LIMIT 1;`

**App won't start**
- Check `.env.local` has all 3 variables
- Verify Supabase credentials are correct
- Run `npm install` again

## Next Steps

- Add more users (leaders and kids)
- Add more memory items (verses)
- Start tracking real data!

For detailed setup, see `docs/setup-guide.md`

