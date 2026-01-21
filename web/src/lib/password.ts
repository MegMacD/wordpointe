import crypto from 'crypto';

/**
 * Simple password hashing for MVP.
 * In production, use bcrypt or argon2.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(':');
  if (!salt || !hash) {
    return false;
  }
  const computedHash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return computedHash === hash;
}

