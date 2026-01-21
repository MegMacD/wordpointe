import { hashPassword, verifyPassword } from '../password';

describe('Password Hashing', () => {
  it('should hash a password', () => {
    const password = 'testpassword123';
    const hash = hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).toContain(':');
    expect(hash.split(':')).toHaveLength(2);
  });

  it('should produce different hashes for the same password (salt)', () => {
    const password = 'testpassword123';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    // Should be different due to random salt
    expect(hash1).not.toBe(hash2);
  });

  it('should verify correct password', () => {
    const password = 'testpassword123';
    const hash = hashPassword(password);

    expect(verifyPassword(password, hash)).toBe(true);
  });

  it('should reject incorrect password', () => {
    const password = 'testpassword123';
    const wrongPassword = 'wrongpassword';
    const hash = hashPassword(password);

    expect(verifyPassword(wrongPassword, hash)).toBe(false);
  });

  it('should reject invalid hash format', () => {
    const password = 'testpassword123';
    const invalidHash = 'invalid-hash-format';

    expect(verifyPassword(password, invalidHash)).toBe(false);
  });

  it('should handle empty password', () => {
    const password = '';
    const hash = hashPassword(password);

    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('notempty', hash)).toBe(false);
  });
});

