# 📖 Word Pointe (Bible Memory Tracker App)

A lightweight web app to help KidMin leaders and kids track Bible memory verses and reward points — fast, simple, and shared between multiple leaders.

---

## 🌟 Overview

This app lets leaders and kids:
- **Record Bible verses** - First time or repeat, with automatic verse lookup
- **Earn points** for memorization (10 pts first, 5 pts repeat by default)
- **Spend points** on prizes
- **View any verse in multiple translations** (ESV, NIV, KJV, NKJV, NLT, NASB)
- **Add verses on-the-fly** - Type any Bible reference and the app fetches it automatically
- **Track progress** - Leaders can view current points and records
- **Admin features** - Manage memory items, settings, and reports

Everyone—kids and leaders—is a **user**.  
Leaders can memorize too (to set a good example!) and are marked with a flag in the database.

---

## ✨ Key Features

### 📚 Bible Verse System
- **Auto-fetch verses**: Type "John 3:16" and the app fetches the NIV text automatically
- **Multiple versions**: View verses in ESV, NIV, KJV, NKJV, NLT, or NASB
- **Smart validation**: Prevents impossible verses like "John 50:1" or "1 John 1:800"
- **Verse ranges**: Support for multi-verse passages like "Psalm 23:1-6"
- **Pre-loaded common verses**: 47+ popular memory verses ready to use
- **Books & More**: Custom memory items for books of the Bible, creeds, etc.

### 🎯 Point System
- Automatic point calculation based on verse length
- Track first-time vs. repeat recitations
- Spend points on prizes with undo capability
- Real-time point totals for all users

---

## 🧱 Tech Stack

| Component | Choice | Notes |
|------------|---------|-------|
| Database | [Supabase](https://supabase.com) | Free tier PostgreSQL + optional auth later |
| Frontend | Next.js (or SvelteKit – TBD) | CursorAI can scaffold this |
| Styling | TailwindCSS | Clean, mobile-friendly UI |
| Hosting | Supabase (DB) + Vercel (Frontend) | Fully free-tier capable |
| Auth | Shared admin password for MVP | Expandable to real auth later |

---

## 🗄️ Database Schema (MVP)

All SQL below is compatible with Supabase.

```sql
-- USERS TABLE
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_leader boolean default false,
  notes text,
  total_points int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEMORY ITEMS TABLE
create table memory_items (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('verse', 'custom')) default 'verse',
  reference text not null,
  text text,
  points_first int default 10,
  points_repeat int default 5,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- VERSE RECORDS
create table verse_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  memory_item_id uuid references memory_items(id),
  record_type text check (record_type in ('first', 'repeat')),
  points_awarded int not null,
  recorded_at timestamptz default now()
);

-- SPEND RECORDS
create table spend_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  points_spent int not null check (points_spent > 0),
  note text,
  spent_at timestamptz default now(),
  undone boolean default false
);

-- SETTINGS TABLE
create table settings (
  id uuid primary key default gen_random_uuid(),
  default_points_first int default 10,
  default_points_repeat int default 5,
  created_at timestamptz default now()
);

-- VIEW: USER POINTS SUMMARY
create view user_points_summary as
select
  u.id,
  u.name,
  u.is_leader,
  coalesce(sum(v.points_awarded), 0) - coalesce(sum(s.points_spent), 0) as current_points
from users u
left join verse_records v on v.user_id = u.id
left join spend_records s on s.user_id = u.id and s.undone = false
group by u.id, u.name, u.is_leader;

---

## 🚀 Quick Start

See `QUICK_START.md` for a 15-minute setup guide, or `docs/setup-guide.md` for detailed instructions.

**TL;DR:**
1. Run database migrations in Supabase SQL Editor
2. Create users with passwords (use `web/scripts/generate-password-hash.js`)
3. Configure `.env.local` with Supabase credentials
4. Run `npm install && npm run dev`
5. Login and start using!

---

## 📚 Documentation

### Getting Started
- `QUICK_START.md` - Get running fast
- `docs/setup-guide.md` - Complete setup instructions
- `SETUP_CHECKLIST.md` - Setup verification checklist

### Deployment & Production
- `docs/DEPLOYMENT_GUIDE.md` - Deploy to Vercel for UAT
- `docs/PRE_DEPLOYMENT_CHECKLIST.md` - Pre-deployment tasks
- **`docs/PRODUCTION_ROLLOUT.md`** - **Complete production rollout plan**
- **`docs/ROLLOUT_QUICKSTART.md`** - **Quick rollout steps**
- `supabase/production_setup.sql` - Database cleanup and setup script

### User & Testing
- `USER_ACCEPTANCE_TESTING.md` - Testing guide for users
- `docs/USER_CREATION_GUIDE.md` - How to create and manage users
- `web/README-TESTING.md` - Developer testing guide

### Technical Reference
- `docs/auth-setup.md` - Authentication setup
- `docs/auth-migration-guide.md` - How to switch auth providers later
- `docs/product-spec.md` - Product requirements
- `docs/data-model.md` - Database schema details
- `docs/api-contract.md` - API endpoints
- `docs/implementation-plan.md` - Development roadmap
- `docs/roadmap.md` - Feature roadmap