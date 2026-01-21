/**
 * Simple admin secret management for MVP.
 * In production, replace with proper authentication.
 */

export function getAdminSecret(): string {
  // Check localStorage first (set via login form or manually)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_secret');
    if (stored) {
      return stored;
    }
  }

  // Fallback to env var (must be NEXT_PUBLIC_* for client-side)
  return process.env.NEXT_PUBLIC_ADMIN_SECRET || '';
}

export function setAdminSecret(secret: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_secret', secret);
  }
}

