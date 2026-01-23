#!/usr/bin/env node

/**
 * Create a new leader or admin user for Word Pointe
 * 
 * This script generates SQL to create a new authenticated user.
 * Only admins should run this script - there is no public signup.
 * 
 * Usage:
 *   node scripts/create-user.js <name> <password> <role>
 * 
 * Examples:
 *   node scripts/create-user.js "Sarah Johnson" mypassword123 leader
 *   node scripts/create-user.js "John Admin" securepass admin
 */

const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

function generateUserId() {
  // Generate a UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('\n❌ Error: Incorrect number of arguments\n');
  console.log('Usage: node scripts/create-user.js <name> <password> <role>');
  console.log('\nArguments:');
  console.log('  name     - Full name of the user (use quotes if it contains spaces)');
  console.log('  password - Password for the user (minimum 6 characters recommended)');
  console.log('  role     - Either "leader" or "admin"');
  console.log('\nExamples:');
  console.log('  node scripts/create-user.js "Sarah Johnson" mypassword123 leader');
  console.log('  node scripts/create-user.js "John Smith" admin456 admin');
  console.log('\n⚠️  Security Note: This should only be run by administrators.\n');
  process.exit(1);
}

const [name, password, role] = args;

// Validate inputs
if (!name || name.trim().length === 0) {
  console.error('\n❌ Error: Name cannot be empty\n');
  process.exit(1);
}

if (password.length < 6) {
  console.error('\n❌ Error: Password should be at least 6 characters\n');
  process.exit(1);
}

if (role !== 'leader' && role !== 'admin') {
  console.error('\n❌ Error: Role must be either "leader" or "admin"\n');
  process.exit(1);
}

// Generate password hash and user ID
const passwordHash = hashPassword(password);
const userId = generateUserId();

// Output results
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║            Word Pointe - New User Creation                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📝 User Details:');
console.log(`   Name:     ${name}`);
console.log(`   Role:     ${role}`);
console.log(`   Password: ${password}`);
console.log(`   User ID:  ${userId}`);
console.log(`   Hash:     ${passwordHash}\n`);

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('📋 SQL to run in Supabase SQL Editor:\n');
console.log('```sql');
console.log(`-- Create new ${role}: ${name}`);
console.log(`INSERT INTO users (id, name, is_leader, role, password_hash, notes, created_at, updated_at)`);
console.log(`VALUES (`);
console.log(`  '${userId}',`);
console.log(`  '${name.replace(/'/g, "''")}',  -- Name (escaped)`);
console.log(`  true,                            -- is_leader (always true for authenticated users)`);
console.log(`  '${role}',                        -- Role: 'leader' or 'admin'`);
console.log(`  '${passwordHash}',                -- Password hash`);
console.log(`  NULL,                            -- Notes (optional)`);
console.log(`  NOW(),                           -- created_at`);
console.log(`  NOW()                            -- updated_at`);
console.log(`);\n`);
console.log('-- Verify the user was created');
console.log(`SELECT id, name, role, is_leader FROM users WHERE name = '${name.replace(/'/g, "''")}';`);
console.log('```\n');

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('📌 Next Steps:\n');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Click "+ New query"');
console.log('4. Copy and paste the SQL above');
console.log('5. Click "Run"');
console.log(`6. Test login with username "${name}" and the password\n`);

console.log('⚠️  Security Reminders:\n');
console.log('• Store the password securely (give it directly to the user)');
console.log('• Delete this terminal output after creating the user');
console.log('• Only create leader/admin accounts for trusted individuals');
console.log(`• ${role === 'admin' ? 'Admins have full access to all data and settings' : 'Leaders can record verses and manage users'}\n`);

console.log('═══════════════════════════════════════════════════════════════\n');
