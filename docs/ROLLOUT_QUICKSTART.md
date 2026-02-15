# Production Rollout - Quick Start

**Goal:** Remove test data and create real user accounts for launch.

---

## ⚡ Quick Steps

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/ltiblcibhpjimfhyaopg/sql/new

### 2. Run the Setup Script

Copy the contents of `supabase/production_setup.sql` and paste into SQL Editor.

The script has commented sections - uncomment each section as you complete it:

1. **Section 1**: Verify migrations (run as-is)
2. **Section 2**: Backup test data (optional - uncomment to view)
3. **Section 3**: Clean test data - USERS (⚠️ DANGER - uncomment when ready)
4. **Section 4**: Clean test data - VERSES (⚠️ IMPORTANT - removes all verses)
5. **Section 5**: Configure settings - CRITICAL (set defaults before importing verses)
6. **Section 6**: Import clean verses (run seed file separately)
7. **Section 7**: Create real users (edit names, then uncomment)
8. **Section 8**: Add legacy points (if needed)
9. **Section 9**: Verify setup (run as-is)

### 3. Configure Default Settings

**BEFORE importing verses**, set your default values:
- Edit Section 5 in the SQL script
- Set `default_points_first` (recommended: 10)
- Set `default_points_repeat` (recommended: 5)  
- Set `bible_version` (ESV, NIV, KJV, NKJV, NLT, or NASB)
- Run that section

### 4. Import Clean Verses

After configuring settings, load fresh verses with correct data:
- Copy contents of `supabase/seed_common_verses.sql` (recommended)
- OR `supabase/verse_library.sql` (comprehensive)
- Paste into Supabase SQL Editor and run

### 5. Update Admin Password

1. Go to Vercel: https://vercel.com
2. Your Project → Settings → Environment Variables
3. Edit `ADMIN_SHARED_SECRET` to a new strong password
4. Save and redeploy

### 6. Share Admin Access

Give the new admin secret to your leaders so they can:
- Log in at `/login`
- Record verses
- Manage students

---

## 📚 Full Documentation

For detailed step-by-step instructions, see:
- **[PRODUCTION_ROLLOUT.md](PRODUCTION_ROLLOUT.md)** - Complete rollout guide

---

## ✅ Rollout Checklist

- [ ] Verify all migrations applied (Section 1)
- [ ] Backup test data if needed (Section 2)
- [ ] Delete all test users (Section 3)
- [ ] Delete all test verses (Section 4)
- [ ] Configure default settings - points & Bible version (Section 5)
- [ ] Import clean verse library (Section 6)
- [ ] Add real students and leaders (Section 7)
- [ ] Import legacy points if applicable (Section 8)
- [ ] Verify settings, users, verses, and points (Section 9)
- [ ] Update admin password in Vercel
- [ ] Test admin login with new password
- [ ] Train leaders on how to use the system
- [ ] Announce to students

---

## 🎯 User Types to Create

**Students** (is_leader = false):
- Regular kids who memorize verses
- Can view their own points
- Can see leaderboard

**Leaders** (is_leader = true):
- Teachers, helpers
- Can add new memory items
- Need admin password for full access

**Admins** (anyone with the secret):
- Full access to all features
- Share the admin secret with trusted leaders
- Can adjust points, view reports, manage users

---

## 🚀 After Rollout

1. Record a test verse to verify points work
2. Check leaderboard displays correctly
3. Export user history for first backup
4. Monitor daily for first week

---

Need help? See the full guide: **[PRODUCTION_ROLLOUT.md](PRODUCTION_ROLLOUT.md)**
