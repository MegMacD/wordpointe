/**
 * EXAMPLE: NextAuth.js implementation
 * 
 * To switch to NextAuth:
 * 1. Install: npm install next-auth
 * 2. Create pages/api/auth/[...nextauth].ts with your config
 * 3. Replace SimpleAuthProvider with this implementation
 * 4. Update auth.ts to export this instead
 * 
 * This is a template - you'll need to adapt it to your needs
 */

// import { getServerSession } from 'next-auth/next';
import type { AuthProvider, AuthUser } from './types';
// import { authOptions } from '@/pages/api/auth/[...nextauth]';

/*
// Commented out to avoid TypeScript errors without next-auth installed
export class NextAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<AuthUser | null> {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    // Map NextAuth session to AuthUser
    return {
      id: session.user.id,
      name: session.user.name || 'Unknown',
      role: session.user.role as 'leader' | 'admin',
      is_leader: session.user.is_leader || false,
    };
  }

  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  }

  async requireAdmin(): Promise<AuthUser> {
    const user = await this.requireAuth();
    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    return user;
  }

  async login(credentials: { name: string; password: string }): Promise<AuthUser> {
    // NextAuth handles login via signIn()
    // This would typically be called from the client side
    throw new Error('NextAuth login should be handled via signIn() from client');
  }

  async logout(): Promise<void> {
    // NextAuth handles logout via signOut()
    // This would typically be called from the client side
    throw new Error('NextAuth logout should be handled via signOut() from client');
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin' ?? false;
  }
}
*/

// Uncomment and use this when ready to switch:
// export const authProvider: AuthProvider = new NextAuthProvider();

