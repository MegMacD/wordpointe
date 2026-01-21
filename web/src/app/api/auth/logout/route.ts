import { NextRequest, NextResponse } from 'next/server';
import { authProvider } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Use auth provider (swappable implementation)
    await authProvider.logout();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}

