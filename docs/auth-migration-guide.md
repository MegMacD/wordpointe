# Auth Migration Guide

This guide explains how to migrate from the simple MVP auth to a production-ready solution (Supabase Auth, NextAuth, etc.).

## Current Architecture

The app uses an **abstracted auth system** that makes swapping implementations easy:

```
lib/auth/
  ├── types.ts              # AuthProvider interface
  ├── simple-auth.ts        # Current MVP implementation
  ├── supabase-auth-example.ts  # Template for Supabase Auth
  └── nextauth-example.ts   # Template for NextAuth

lib/auth.ts                 # Main export (change import here to switch)
```

## How It Works

All code imports from `@/lib/auth`:
```typescript
import { getCurrentUser, requireAuth, requireAdmin } from '@/lib/auth';
```

The actual implementation is swappable by changing one line in `lib/auth.ts`.

## Migrating to Supabase Auth

### 1. Install Dependencies

```bash
npm install @supabase/ssr
```

### 2. Update `lib/auth.ts`

Change:
```typescript
// Current
export { authProvider, ... } from './auth/simple-auth';

// To
export { authProvider, ... } from './auth/supabase-auth';
```

### 3. Implement Supabase Auth Provider

Copy `lib/auth/supabase-auth-example.ts` to `lib/auth/supabase-auth.ts` and implement:

```typescript
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthProvider, AuthUser } from './types';

export class SupabaseAuthProvider implements AuthProvider {
  // Implement all methods from AuthProvider interface
  // See example file for structure
}

export const authProvider: AuthProvider = new SupabaseAuthProvider();
```

### 4. Update Database Schema

- Remove `sessions` table (Supabase handles sessions)
- Keep `password_hash` column or remove if using Supabase Auth only
- Add email column if needed
- Set up Supabase Auth in dashboard

### 5. Update Client Components

If using Supabase Auth, you may need to update client-side auth checks:

```typescript
// Client component example
'use client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);
const { data: { user } } = await supabase.auth.getUser();
```

### 6. Update API Routes

API routes should continue to work as-is since they use the abstracted `requireAuth()` / `requireAdmin()` functions.

## Migrating to NextAuth

### 1. Install Dependencies

```bash
npm install next-auth
```

### 2. Create NextAuth Config

Create `pages/api/auth/[...nextauth].ts` or `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      // Your credential validation
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      session.user.role = token.role;
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

### 3. Update `lib/auth.ts`

Change:
```typescript
export { authProvider, ... } from './auth/nextauth';
```

### 4. Implement NextAuth Provider

Copy `lib/auth/nextauth-example.ts` to `lib/auth/nextauth.ts` and implement:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import type { AuthProvider, AuthUser } from './types';

export class NextAuthProvider implements AuthProvider {
  // Implement all methods
}

export const authProvider: AuthProvider = new NextAuthProvider();
```

### 5. Update Client Components

Use NextAuth's `useSession()` hook:

```typescript
'use client';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
```

## Custom Auth Implementation

To implement your own auth system:

1. Create `lib/auth/custom-auth.ts`
2. Implement the `AuthProvider` interface from `types.ts`
3. Update `lib/auth.ts` to export your provider

Example:

```typescript
import type { AuthProvider, AuthUser } from './types';

export class CustomAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<AuthUser | null> {
    // Your implementation
  }

  async requireAuth(): Promise<AuthUser> {
    // Your implementation
  }

  // ... implement all other methods
}

export const authProvider: AuthProvider = new CustomAuthProvider();
```

## Testing the Migration

1. **Test login/logout flows**
2. **Verify role-based access** (leader vs admin)
3. **Check API route protection** still works
4. **Test session persistence** (refresh page, should stay logged in)
5. **Test session expiration** (if applicable)

## Rollback Plan

If something goes wrong:

1. Revert `lib/auth.ts` to use `simple-auth`
2. Restore database schema if needed
3. Remove new dependencies if switching back

The abstracted interface means you can switch back and forth without changing any other code!

## Benefits of This Architecture

✅ **Zero code changes** in pages/components when switching auth  
✅ **Easy to test** different auth providers  
✅ **Future-proof** - ready for production auth  
✅ **Type-safe** - TypeScript ensures correct implementation  
✅ **Clear migration path** - examples provided

## Questions?

- Check the example files in `lib/auth/`
- Review the `AuthProvider` interface in `lib/auth/types.ts`
- All app code uses the abstracted functions, so switching is just changing one import!

