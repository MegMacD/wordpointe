import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { password, clear } = body;

    if (clear) {
      // Remove password — disables login for this user
      const { error } = await supabase
        .from('users')
        .update({ password_hash: null, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return NextResponse.json({ message: 'Login access removed' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify target user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, role, is_leader')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only users marked as leaders (or admins) are eligible for login credentials.
    if (!user.is_leader && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only leaders or admins can have login access' },
        { status: 400 }
      );
    }

    const password_hash = hashPassword(password);

    const { error } = await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: `Password updated for ${user.name}` });
  } catch (error: any) {
    if (error.message === 'Admin access required' || error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update password' },
      { status: 500 }
    );
  }
}
