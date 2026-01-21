// Script to generate password hashes for users
// Run: node scripts/generate-password-hash.js

const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

// Example usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/generate-password-hash.js <password>');
  console.log('\nExample:');
  console.log('  node scripts/generate-password-hash.js admin123');
  process.exit(1);
}

const password = args[0];
const hashed = hashPassword(password);
console.log(`\nPassword: ${password}`);
console.log(`Hash: ${hashed}\n`);
console.log('SQL to update user:');
console.log(`UPDATE users SET password_hash = '${hashed}' WHERE name = 'YourUserName';`);

