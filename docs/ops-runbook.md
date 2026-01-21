# Ops / Runbook

## Environments
- Local: Next.js dev + Supabase project (or local Supabase)
- Staging (optional): Vercel preview + Supabase
- Production: Vercel + Supabase

## Secrets (Vercel)
- NEXT_PUBLIC_SUPABASE_URL: https URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: anon key
- SUPABASE_SERVICE_ROLE_KEY: server-only; used in server routes only
- ADMIN_SHARED_SECRET: header secret for admin routes (MVP)

## Seeding
- Preferred: SQL seed via CLI
  - Run: `supabase db seed --file ./seed.sql`
  - Use for dev/staging/prod (manual in prod)
- Optional: one-off TS seed route
  - Create `/api/seed` with header secret gate; run once; remove after

## RLS Plan (later)
- Enable RLS on all tables
- Policies:
  - Leaders: full read/write
  - Non-leaders (kids): read own records only (if ever authenticated)
- Until then, keep all writes on server routes using service role key; do not expose service key to client

## Backups
- Supabase automated backups (project settings)
- Export CSV for critical reports periodically (manual)

## Migrations
- Keep schema.sql and improvements SQL in versioned files under `supabase/migrations/`
- Apply via Supabase CLI or SQL editor

## Monitoring
- Supabase logs for API/DB
- Vercel function logs

## Incidents / Recovery
- If overspend recorded: use undo on spend_records
- If bad record: delete specific verse_record or mark corrected entry; totals will recompute
- If admin secret leaked: rotate ADMIN_SHARED_SECRET in Vercel; redeploy

## Deployment
- Vercel builds on main branch
- Do not auto-run seeds on deploy; seed manually when needed

