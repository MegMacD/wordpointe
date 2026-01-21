/**
 * Simple authentication implementation (MVP)
 * This can be replaced with Supabase Auth, NextAuth, etc. by implementing AuthProvider
 */

import { getSupabaseAdmin } from '../supabase-server';
import { cookies } from 'next/headers';
import { verifyPassword } from '../password';
import { hashPassword } from '../password';
import crypto from 'crypto';
import type { AuthProvider, AuthUser } from './types';

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function createSession(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await supabase.from('sessions').insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  return token;
}

async function getSessionUser(token: string): Promise<AuthUser | null> {
  const supabase = getSupabaseAdmin();

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, name, role, is_leader')
    .eq('id', session.user_id)
    .single();

  if (!user || !user.role) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    role: user.role as 'leader' | 'admin',
    is_leader: user.is_leader,
  };
}

async function deleteSession(token: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('sessions').delete().eq('token', token);
}

/**
 * Simple auth provider implementation (current MVP solution)
 * To replace with Supabase Auth or NextAuth, create a new provider implementing AuthProvider
 */
export class SimpleAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return null;
    }

    return getSessionUser(token);
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
    const supabase = getSupabaseAdmin();

    // Use case-insensitive username lookup with ilike
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, role, password_hash, is_leader')
      .ilike('name', credentials.name)
      .single();

    if (error || !user || !user.password_hash) {
      throw new Error('Invalid credentials');
    }

    if (!verifyPassword(credentials.password, user.password_hash)) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const token = await createSession(user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role as 'leader' | 'admin',
      is_leader: user.is_leader,
    };
  }

  async logout(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      await deleteSession(token);
    }

    cookieStore.delete('session_token');
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin' || false;
  }
}

// Export singleton instance
export const authProvider: AuthProvider = new SimpleAuthProvider();

// Export helper functions that use the provider
export async function getCurrentUser(): Promise<AuthUser | null> {
  return authProvider.getCurrentUser();
}

export async function requireAuth(): Promise<AuthUser> {
  return authProvider.requireAuth();
}

export async function requireAdmin(): Promise<AuthUser> {
  return authProvider.requireAdmin();
}

