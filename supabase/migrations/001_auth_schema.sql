-- Add authentication columns to users table
-- This allows users (leaders) to log in with their own credentials

alter table users
  add column if not exists password_hash text,
  add column if not exists role text check (role in ('leader', 'admin')) default 'leader';

-- Create index for username/email lookups (if we add email later)
-- For now, we'll use name as the login identifier
create index if not exists idx_users_name on users(name);

-- Create a simple session table for tracking active sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_sessions_token on sessions(token);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_expires_at on sessions(expires_at);

-- Function to clean up expired sessions (optional, can be called periodically)
create or replace function cleanup_expired_sessions()
returns void as $$
begin
  delete from sessions where expires_at < now();
end;
$$ language plpgsql;

-- IMPORTANT: After running this migration, you need to:
-- 1. Generate password hashes using: node scripts/generate-password-hash.js <password>
-- 2. Update your existing users with password_hash and role:
--    UPDATE users SET password_hash = 'generated-hash', role = 'admin' WHERE name = 'YourName';
-- See docs/auth-setup.md for complete instructions.

