/**
 * EXAMPLE: Supabase Auth implementation
 * 
 * To switch to Supabase Auth:
 * 1. Install: npm install @supabase/ssr
 * 2. Replace SimpleAuthProvider with this implementation
 * 3. Update auth.ts to export this instead
 * 
 * This is a template - you'll need to adapt it to your needs
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthProvider, AuthUser } from './types';

/*
export class SupabaseAuthProvider implements AuthProvider {
  private async getSupabase() {
    const cookieStore = await cookies();
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await this.getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Fetch user role from your users table
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_leader')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return null;
    }

    return {
      id: user.id,
      name: user.user_metadata?.name || user.email || 'Unknown',
      role: userData.role as 'leader' | 'admin',
      is_leader: userData.is_leader,
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
    // With Supabase Auth, you'd use email/password or magic links
    // This is just an example structure
    const supabase = await this.getSupabase();
    
    // Option 1: Email/Password
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: credentials.email,
    //   password: credentials.password,
    // });

    // Option 2: Magic Link
    // const { data, error } = await supabase.auth.signInWithOtp({
    //   email: credentials.email,
    // });

    throw new Error('Supabase Auth login not implemented');
  }

  async logout(): Promise<void> {
    const supabase = await this.getSupabase();
    await supabase.auth.signOut();
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
// export const authProvider: AuthProvider = new SupabaseAuthProvider();

