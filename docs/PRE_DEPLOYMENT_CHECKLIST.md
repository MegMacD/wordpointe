# Pre-Deployment Checklist

Complete these steps before deploying to UAT:

## ✅ Preparation Tasks

### 1. Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Copy contents of all migrations up to and including `supabase/migrations/009_update_user_points_summary_accommodation_note.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify: Run `SELECT * FROM bonus_records LIMIT 1;` (should not error)
- [ ] Verify: Run `SELECT * FROM user_points_summary LIMIT 1;` (should include bonus points, notes, and display_accommodation_note fields)

### 2. Environment Variables Ready
- [ ] Supabase Project URL copied
- [ ] Supabase Anon Key copied
- [ ] Supabase Service Role Key copied (keep secret!)
- [ ] Admin Shared Secret generated (32+ random characters)

### 3. Code Ready
- [ ] All changes committed to git
- [ ] No TypeScript errors (run `npm run build` in web/ folder to verify)
- [ ] Git repository pushed to GitHub/GitLab

### 4. Vercel Account
- [ ] Vercel account created (free tier)
- [ ] GitHub connected to Vercel (if deploying from GitHub)

## 🚀 Deployment Steps

Follow the full guide: [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)

Quick summary:
1. Go to Vercel → New Project
2. Import your repository
3. Set Root Directory to `web`
4. Add 4 environment variables
5. Deploy!

## 🧪 Post-Deployment Verification

- [ ] Homepage loads
- [ ] Login works with existing admin user
- [ ] Users page displays correctly
- [ ] Can record a verse
- [ ] Admin menu dropdown works
- [ ] Adjust Points page works
- [ ] Points calculation correct
- [ ] Mobile responsive

## 📋 UAT Testing

Once deployed, follow the testing guide:
- See [`USER_ACCEPTANCE_TESTING.md`](USER_ACCEPTANCE_TESTING.md) for comprehensive test scenarios

## ⚠️ Common Issues

**If deployment fails:**
- Check that Root Directory is set to `web` in Vercel
- Verify all 4 environment variables are set
- Check build logs in Vercel dashboard

**If app doesn't work after deployment:**
- Most common: Migration not run (Step 1 above)
- Second most common: Environment variables missing/incorrect


## 📊 Current Features for UAT

Users can test:
- ✅ User management (add kids, add leaders)
- ✅ Record verse memorization (existing verses)
- ✅ Record custom verses (on-the-fly creation with Bible API)
- ✅ Point calculations (first-time: 10, repeats: 2^n)
- ✅ Spending points
- ✅ Viewing reports
- ✅ **NEW**: Add users with legacy points
- ✅ **NEW**: Adjust points (admin-only, arbitrary grants)
- ✅ **NEW**: Auto-fetch verse text in admin forms
- ✅ **NEW**: Accommodation notes and display flag for users (shown to leaders when recording)

## 🎯 Focus Areas for UAT Feedback

Ask testers to pay attention to:
1. **Ease of use**: Is navigation intuitive?
2. **Points clarity**: Do point calculations make sense?
3. **Verse entry**: Is custom verse entry easy?
4. **Admin features**: Are admin tools accessible but not overwhelming?
5. **Mobile experience**: Does it work well on phones?
6. **Edge cases**: What happens with unusual inputs?

---

Ready to deploy? Start with the database migration (Step 1) then follow [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)!
