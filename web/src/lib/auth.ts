/**
 * Main auth export - use this throughout the app
 * 
 * To switch auth providers:
 * 1. Change the import in this file
 * 2. All other code will automatically use the new provider
 */

// Current: Simple auth (MVP)
export { authProvider, getCurrentUser, requireAuth, requireAdmin } from './auth/simple-auth';

// Future: Uncomment to switch to Supabase Auth
// export { authProvider, getCurrentUser, requireAuth, requireAdmin } from './auth/supabase-auth';

// Future: Uncomment to switch to NextAuth
// export { authProvider, getCurrentUser, requireAuth, requireAdmin } from './auth/nextauth';

// Re-export types for convenience
export type { AuthUser, AuthProvider } from './auth/types';
