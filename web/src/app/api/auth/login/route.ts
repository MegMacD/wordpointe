import { NextRequest, NextResponse } from 'next/server';
import { authProvider } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Use auth provider (swappable implementation)
    const user = await authProvider.login({ name, password });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

