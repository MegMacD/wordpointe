# Data Model & ERD

## Entities
- users
- memory_items
- verse_records
- spend_records
- settings
- view: user_points_summary

## ERD (text)
users (id) 1---* verse_records (user_id)
users (id) 1---* spend_records (user_id)
memory_items (id) 1---* verse_records (memory_item_id)

## Tables
### users
- id uuid pk default gen_random_uuid()
- name text not null
- is_leader boolean default false
- notes text
- total_points int default 0 (not used for totals; keep for legacy/simple UI)
- created_at timestamptz default now()
- updated_at timestamptz default now()

### memory_items
- id uuid pk default gen_random_uuid()
- type text check in ('verse','custom') default 'verse'
- reference text not null (e.g., "John 3:16" or a custom label)
- text text (optional verse text)
- points_first int default 10
- points_repeat int default 5
- active boolean default true
- created_at timestamptz default now()
- updated_at timestamptz default now()

### verse_records
- id uuid pk default gen_random_uuid()
- user_id uuid fk -> users(id) on delete cascade
- memory_item_id uuid fk -> memory_items(id) on delete cascade
- record_type text check in ('first','repeat')
- points_awarded int not null
- recorded_at timestamptz default now()

### spend_records
- id uuid pk default gen_random_uuid()
- user_id uuid fk -> users(id) on delete cascade
- points_spent int not null check (points_spent > 0)
- note text
- spent_at timestamptz default now()
- undone boolean default false

### settings
- id uuid pk default gen_random_uuid()
- default_points_first int default 10
- default_points_repeat int default 5
- created_at timestamptz default now()

### view: user_points_summary
- id (users.id)
- name
- is_leader
- current_points = sum(verse_records.points_awarded) - sum(spend_records.points_spent where undone=false)

## Constraints & Indexes
- Unique first-only per (user_id, memory_item_id):
  - unique index on verse_records(user_id, memory_item_id) where record_type='first'
- Foreign keys with on delete cascade:
  - verse_records.user_id, verse_records.memory_item_id, spend_records.user_id
- Indexes:
  - verse_records(user_id), verse_records(memory_item_id)
  - spend_records(user_id)
  - spend_records(user_id) where undone=false (partial index for view)
  - memory_items(active), memory_items(type)

## Triggers
- updated_at triggers on users and memory_items (before update set updated_at=now())
- Optional: points_awarded before insert trigger to compute from memory_items and record_type

## Notes
- Totals should be derived from records; avoid trusting users.total_points.
- Consider PostgreSQL enums for type and record_type in future.
- Bible verses are auto-created on-demand when first recorded via Bible API integration.
- The unique constraint on memory_items.reference prevents duplicate verses.

