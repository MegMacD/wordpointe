-- Main Database Schema
-- Run this FIRST in Supabase SQL Editor

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
  memory_item_id uuid references memory_items(id) on delete cascade,
  record_type text check (record_type in ('first', 'repeat')),
  points_awarded int not null,
  applied_multiplier numeric default 1.0 not null,
  applied_promo text,
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

