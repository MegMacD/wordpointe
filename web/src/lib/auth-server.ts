/**
 * @deprecated Use auth.ts instead
 * This file is kept for backward compatibility but will be removed
 * 
 * All new code should import from '@/lib/auth'
 */
export {
  getCurrentUser,
  requireAuth,
  requireAdmin,
  type AuthUser as SessionUser,
} from './auth';

