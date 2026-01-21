# Word Pointe

A Next.js app for tracking Bible memory verses and points for KidMin at North Pointe.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials from:
   - Project Settings → API
   - Copy: Project URL, anon public key, service_role key

3. Set `ADMIN_SHARED_SECRET` to a password-like string for admin routes (MVP authentication)

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

1. Run the SQL schema from `../docs/data-model.md` in your Supabase SQL Editor
2. Run the improvements SQL (indexes, triggers, etc.) 
3. Optionally seed data using the SQL seed file

## Authentication

The app uses a simple two-tier authentication system:
- **Leader**: Can record memories, spend points, view users
- **Admin**: Can do everything leaders can, plus manage memory items, settings, and reports

See `../docs/auth-setup.md` for complete setup instructions.

### Quick Setup

1. Run the auth migration SQL in Supabase (see `supabase/migrations/001_auth_schema.sql`)
2. Generate password hashes for your users:
   ```bash
   cd web
   node scripts/generate-password-hash.js yourpassword
   ```
3. Update users in Supabase with the generated hash:
   ```sql
   UPDATE users SET password_hash = 'generated-hash', role = 'admin' WHERE name = 'YourName';
   ```
4. Log in at `/login` with your name and password

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/app/api/` - API routes (server-side)
- `src/lib/` - Utilities (Supabase client, types, points computation)
- `src/components/` - React components

## Features

- Record memory verses (first time or repeat)
- Spend points with undo support
- View users and their points
- Admin: Manage memory items, settings, reports
