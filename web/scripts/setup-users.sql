-- Script to set up initial leader and admin users
-- Run this in Supabase SQL Editor after running the auth migration

-- First, import the password hashing function or use a simple hash
-- For MVP, we'll use a simple approach: password_hash = sha256(password + salt)

-- Example: Create an admin user
-- Password: 'admin123' (CHANGE THIS!)
-- To generate hash: Use Node.js script or online tool
-- For now, we'll use a placeholder that you'll need to replace

-- Update existing users to have passwords
-- Replace 'YourPasswordHashHere' with actual hash from the Node.js script

-- Example admin user (name: 'Admin', password: 'admin123')
-- You'll need to run the Node.js script to get the actual hash
update users
set 
  password_hash = 'YourPasswordHashHere',  -- Replace with actual hash
  role = 'admin'
where name = 'Admin' and is_leader = true;

-- Example leader user (name: 'Leader1', password: 'leader123')
-- Create if doesn't exist, or update existing
insert into users (name, is_leader, role, password_hash)
values (
  'Leader1',
  true,
  'leader',
  'YourPasswordHashHere'  -- Replace with actual hash
)
on conflict (name) do update
set password_hash = excluded.password_hash, role = excluded.role;

-- Note: After running this, use the Node.js script to generate proper password hashes
-- See: scripts/generate-password-hash.js

