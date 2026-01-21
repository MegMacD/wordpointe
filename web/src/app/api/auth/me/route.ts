import { NextRequest, NextResponse } from 'next/server';
import { authProvider } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Use auth provider (swappable implementation)
    const user = await authProvider.getCurrentUser();

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

