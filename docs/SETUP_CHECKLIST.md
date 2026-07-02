# Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Database Setup

- [ ] Created Supabase project
- [ ] Copied Supabase credentials (URL, anon key, service_role key)
- [ ] Ran `000_main_schema.sql` in Supabase SQL Editor
- [ ] Ran `001_improvements.sql` in Supabase SQL Editor
- [ ] Ran `001_auth_schema.sql` in Supabase SQL Editor
- [ ] Ran `seed.sql` in Supabase SQL Editor
- [ ] Verified tables exist: `SELECT * FROM users LIMIT 1;`
- [ ] Verified view works: `SELECT * FROM user_points_summary LIMIT 1;`

## User Setup

- [ ] Generated password hash for admin user: `node scripts/generate-password-hash.js adminpassword`
- [ ] Created admin user in database with password hash and `role = 'admin'`
- [ ] Generated password hash for leader user
- [ ] Created leader user in database with password hash and `role = 'leader'`
- [ ] Verified users exist: `SELECT name, role FROM users WHERE role IS NOT NULL;`

## App Configuration

- [ ] Created `web/.env.local` file
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Installed dependencies: `cd web && npm install`

## Testing

- [ ] Started dev server: `npm run dev`
- [ ] App loads at `http://localhost:3000`
- [ ] Login page works: `/login`
- [ ] Can log in with admin credentials
- [ ] Can log in with leader credentials
- [ ] See user name in nav bar after login
- [ ] Can access `/record` page
- [ ] Can access `/spend` page
- [ ] Can access `/users` page
- [ ] Admin can access `/admin/memory-items`
- [ ] Admin can access `/admin/settings`
- [ ] Admin can access `/admin/reports`
- [ ] Leader cannot access admin pages (redirects to home)

## Feature Testing

### Record Memory
- [ ] Can search for users on Record page
- [ ] Can see user's current points
- [ ] Can search for memory items
- [ ] Can select memory item
- [ ] Can choose "first" or "repeat"
- [ ] Can submit record
- [ ] See success message with points awarded
- [ ] User's points updated after recording

### Spend Points
- [ ] Can select user on Spend page
- [ ] See user's current points displayed
- [ ] Can enter points to spend
- [ ] See remaining balance preview
- [ ] Cannot spend more than available (button disabled)
- [ ] Can submit spend
- [ ] See success message
- [ ] Points updated after spending
- [ ] Can undo recent spend

### Users
- [ ] See list of all users
- [ ] Can search users
- [ ] See current points for each user
- [ ] Can click user to see details
- [ ] User detail shows records and spends

### Admin Features
- [ ] Can see memory items list
- [ ] Can toggle memory item active/inactive
- [ ] Can view settings
- [ ] Can update default points in settings
- [ ] Can view reports
- [ ] Can export CSV from reports

## Troubleshooting

If something doesn't work:

- [ ] Check browser console for errors
- [ ] Check server terminal for errors
- [ ] Verify `.env.local` has correct values
- [ ] Verify database has users with passwords: `SELECT name, role, password_hash IS NOT NULL as has_password FROM users;`
- [ ] Try logging out and back in
- [ ] Clear browser cache/cookies
- [ ] Restart dev server

## Next Steps

Once everything works:
- [ ] Add real users (leaders and kids)
- [ ] Add real memory items (verses for your class)
- [ ] Start using the app!
- [ ] Consider adding missing UI features (add user form, etc.)

