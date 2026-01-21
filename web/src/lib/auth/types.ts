/**
 * Authentication interface - abstracted to allow swapping implementations
 * This makes it easy to replace the simple auth with Supabase Auth, NextAuth, etc.
 */

export interface AuthUser {
  id: string;
  name: string;
  role: 'leader' | 'admin';
  is_leader: boolean;
  // Add more fields as needed (email, etc.)
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: Date;
}

export interface AuthProvider {
  /**
   * Get the current authenticated user
   * Returns null if not authenticated
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Require authentication (throws if not authenticated)
   */
  requireAuth(): Promise<AuthUser>;

  /**
   * Require admin role (throws if not admin)
   */
  requireAdmin(): Promise<AuthUser>;

  /**
   * Login with credentials
   */
  login(credentials: { name: string; password: string }): Promise<AuthUser>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Check if user has admin role
   */
  isAdmin(): Promise<boolean>;
}

