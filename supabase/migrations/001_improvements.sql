-- Database Improvements: Indexes, Constraints, Triggers
-- Run this SECOND (after main schema)

-- Ensure UUID generator is available
create extension if not exists pgcrypto;

-- Symmetric FK behavior (memory items deletions cascade)
alter table verse_records
  drop constraint if exists verse_records_memory_item_id_fkey,
  add constraint verse_records_memory_item_id_fkey
    foreign key (memory_item_id) references memory_items(id) on delete cascade;

-- Unique constraint: only one "first" record per user per memory item
create unique index if not exists ux_verse_records_first_once
  on verse_records(user_id, memory_item_id)
  where record_type = 'first';

-- Indexes for FK lookups and view performance
create index if not exists idx_verse_records_user_id on verse_records(user_id);
create index if not exists idx_verse_records_memory_item_id on verse_records(memory_item_id);
create index if not exists idx_spend_records_user_id on spend_records(user_id);
create index if not exists idx_spend_records_user_id_undone_false on spend_records(user_id) where undone = false;
create index if not exists idx_memory_items_active on memory_items(active);
create index if not exists idx_memory_items_type on memory_items(type);

-- Constraint: points must be non-negative
alter table verse_records
  drop constraint if exists verse_records_points_awarded_positive,
  add constraint verse_records_points_awarded_positive check (points_awarded >= 0);

-- Auto-update updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for auto-updating updated_at
drop trigger if exists set_updated_at_users on users;
create trigger set_updated_at_users
before update on users
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_memory_items on memory_items;
create trigger set_updated_at_memory_items
before update on memory_items
for each row execute function set_updated_at();

