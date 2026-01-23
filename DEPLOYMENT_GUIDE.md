# Deployment Guide - Word Pointe UAT

This guide will walk you through deploying Word Pointe to Vercel for User Acceptance Testing.

## Prerequisites

- [ ] Supabase project already set up
- [ ] GitHub repository with your code
- [ ] Vercel account (free tier works fine) - https://vercel.com

---

## Step 1: Database Migration ⚠️ MUST DO FIRST

Before deploying, you **must** run the latest migration in your Supabase database.

### Run Migration in Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Click **"+ New query"**
4. Copy the entire contents of `supabase/migrations/004_bonus_records.sql`
5. Paste and click **Run**

### Verify Migration Success

Run this query to verify:
```sql
-- Should return without error
SELECT * FROM bonus_records LIMIT 1;

-- Should include bonus_points column
SELECT * FROM user_points_summary LIMIT 1;
```

---

## Step 2: Prepare Environment Variables

You'll need these values from your Supabase dashboard:

1. Go to Supabase → **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`, keep this secret!)

3. Go to Supabase → **Settings** → **API** → **Database**
   - Copy the **Connection String** for later (optional, for direct DB access)

4. Create a random admin secret:
   ```powershell
   # In PowerShell, generate a random secret
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for first-time)

1. **Go to Vercel**: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. **Import your Git repository**:
   - Connect your GitHub account if not already connected
   - Find your `wordpointe` repository
   - Click **"Import"**

4. **Configure Project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**:
   Click **"Environment Variables"** section and add these:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `ADMIN_SHARED_SECRET` | Your generated random secret |

6. Click **"Deploy"**

7. **Wait for deployment** (usually 1-2 minutes)

### Option B: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Navigate to web directory
cd web

# Login to Vercel (opens browser)
vercel login

# Deploy (will prompt for configuration)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? wordpointe (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_SHARED_SECRET

# Deploy to production
vercel --prod
```

---

## Step 4: Verify Deployment

Once deployed, Vercel will give you a URL like: `https://wordpointe-xxxxx.vercel.app`

### Test These Critical Paths:

1. **Homepage loads**: Navigate to your URL
2. **Login works**: Try logging in with your admin account
3. **Users page**: Can you see the users list?
4. **Record page**: Can you record a verse?
5. **Admin features**: 
   - Navigate to Admin → Adjust Points
   - Try granting bonus points
6. **Check points calculation**: Verify points show correctly on Users page

---

## Step 5: Post-Deployment Checklist

- [ ] Migration 004_bonus_records.sql executed in Supabase
- [ ] All environment variables configured in Vercel
- [ ] Homepage loads successfully
- [ ] Login works
- [ ] Can record verses (both existing and custom)
- [ ] Can add new users (with optional legacy points)
- [ ] Admin menu accessible
- [ ] Adjust Points page works
- [ ] Points calculations correct
- [ ] Navigation responsive on mobile

---

## Troubleshooting

### "Supabase client not configured" Error
- **Fix**: Check that environment variables are set correctly in Vercel
- Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
- Verify all 4 variables are present

### "Cannot read from database" Error
- **Fix**: Verify service role key is correct
- Check Supabase RLS (Row Level Security) policies if needed

### Migration Hasn't Run
- **Symptom**: "relation 'bonus_records' does not exist"
- **Fix**: Run Step 1 (Database Migration) in Supabase SQL Editor

### Build Fails on Vercel
- **Fix**: Check build logs in Vercel dashboard
- Common issues:
  - TypeScript errors (should be none currently)
  - Missing dependencies (run `npm install` locally first)
  - Root directory not set to `web`

### Custom Verses Not Working
- **Symptom**: Error when typing custom reference
- **Fix**: Verify Bible API is accessible (no API key needed, public API)

### "Duplicate identifier 'bible_version'" Build Error
- **Symptom**: TypeScript compilation fails with duplicate field error
- **Fix**: This has been fixed in the latest code. Pull the latest changes and redeploy

### Admin Login Flashes Then Returns to Login
- **Symptom**: After entering admin credentials, page briefly flashes then returns to login
- **Fix**: This has been fixed. Ensure you've deployed the latest code with auth improvements
- Clear your browser cache and try again

---

## Next Steps After Deployment

1. **Share UAT link** with your test users
2. **Use the testing guide**: `USER_ACCEPTANCE_TESTING.md`
3. **Collect feedback**: Note any issues or suggestions
4. **Monitor usage**: Check Vercel analytics for errors
5. **Iterate**: Fix issues and redeploy (Vercel auto-deploys on git push)

---

## Environment Variables Reference

| Variable | Purpose | Where to Get It |
|----------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key | Supabase Dashboard → Settings → API → Project API keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key | Supabase Dashboard → Settings → API → Project API keys → service_role |
| `ADMIN_SHARED_SECRET` | Admin route protection | Generate a random string (see Step 2) |

---

## Automatic Deployments

Once set up, Vercel will automatically deploy when you push to your main branch:

```powershell
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will rebuild and deploy within 1-2 minutes.

---

## Cost Estimate

- **Vercel Free Tier**: Perfect for UAT
  - 100GB bandwidth/month
  - Unlimited deploys
  - Automatic HTTPS
  
- **Supabase Free Tier**: Also works for UAT
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

Both free tiers are more than sufficient for UAT!

---

## Support

If you run into issues:
1. Check Vercel build logs: Dashboard → Deployments → Click deployment → View logs
2. Check Supabase logs: Dashboard → Logs
3. Review this guide's Troubleshooting section

Ready to deploy! 🚀
