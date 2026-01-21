-- Seed Data
-- Run this AFTER all migrations
-- 
-- IMPORTANT: For a full verse library, also run seed_common_verses.sql
-- This file contains basic sample data for testing
-- 
-- Adjust values as needed for your Sunday School class

-- Settings
insert into settings (id, default_points_first, default_points_repeat, created_at)
values (gen_random_uuid(), 10, 5, now())
on conflict do nothing;

-- Users (leaders and kids)
-- Note: These don't have passwords - you'll need to add passwords via SQL after running auth migration
insert into users (id, name, is_leader, notes, total_points, created_at, updated_at) values
  (gen_random_uuid(), 'Alice Leader', true, 'Class A Leader', 0, now(), now()),
  (gen_random_uuid(), 'Bob Leader',   true, 'Class B Leader', 0, now(), now()),
  (gen_random_uuid(), 'Charlie Kid',  false, null, 0, now(), now()),
  (gen_random_uuid(), 'Daisy Kid',    false, null, 0, now(), now()),
  (gen_random_uuid(), 'Ethan Kid',    false, null, 0, now(), now())
on conflict do nothing;

-- Memory items (verses)
insert into memory_items (id, type, reference, text, points_first, points_repeat, active, created_at, updated_at) values
  (gen_random_uuid(), 'verse', 'John 3:16', 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 10, 5, true, now(), now()),
  (gen_random_uuid(), 'verse', 'Psalm 23:1', 'The Lord is my shepherd, I lack nothing.', 10, 5, true, now(), now()),
  (gen_random_uuid(), 'verse', 'Philippians 4:13', 'I can do all this through him who gives me strength.', 10, 5, true, now(), now()),
  (gen_random_uuid(), 'custom', 'Books of the New Testament', null, 15, 5, true, now(), now()),
  (gen_random_uuid(), 'custom', 'The Lord''s Prayer', null, 20, 10, true, now(), now())
on conflict do nothing;

-- Sample verse records (using subselects to link to actual users/items)
-- Charlie: first time John 3:16
insert into verse_records (id, user_id, memory_item_id, record_type, points_awarded, recorded_at)
select gen_random_uuid(),
       u.id,
       m.id,
       'first',
       m.points_first,
       now()
from users u, memory_items m
where u.name = 'Charlie Kid' and m.reference = 'John 3:16'
limit 1
on conflict do nothing;

-- Charlie: repeat John 3:16
insert into verse_records (id, user_id, memory_item_id, record_type, points_awarded, recorded_at)
select gen_random_uuid(),
       u.id,
       m.id,
       'repeat',
       m.points_repeat,
       now()
from users u, memory_items m
where u.name = 'Charlie Kid' and m.reference = 'John 3:16'
limit 1
on conflict do nothing;

-- Daisy: first time Psalm 23:1
insert into verse_records (id, user_id, memory_item_id, record_type, points_awarded, recorded_at)
select gen_random_uuid(),
       u.id,
       m.id,
       'first',
       m.points_first,
       now()
from users u, memory_items m
where u.name = 'Daisy Kid' and m.reference = 'Psalm 23:1'
limit 1
on conflict do nothing;

-- Ethan: first time custom item
insert into verse_records (id, user_id, memory_item_id, record_type, points_awarded, recorded_at)
select gen_random_uuid(),
       u.id,
       m.id,
       'first',
       m.points_first,
       now()
from users u, memory_items m
where u.name = 'Ethan Kid' and m.reference = 'Books of the New Testament'
limit 1
on conflict do nothing;

-- Spending examples
insert into spend_records (id, user_id, points_spent, note, spent_at, undone)
select gen_random_uuid(), u.id, 5, 'Candy', now(), false
from users u where u.name = 'Charlie Kid' limit 1
on conflict do nothing;

insert into spend_records (id, user_id, points_spent, note, spent_at, undone)
select gen_random_uuid(), u.id, 10, 'Small toy', now(), false
from users u where u.name = 'Daisy Kid' limit 1
on conflict do nothing;

