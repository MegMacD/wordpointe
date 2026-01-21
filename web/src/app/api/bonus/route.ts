import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { BonusRecord } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('bonus_records')
      .select(`
        *,
        users:user_id(id, name, is_leader)
      `, { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error, count } = await query
      .order('awarded_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: (data || []) as BonusRecord[],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bonus records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Only authenticated users (leaders) can grant bonus points

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { user_id, points_awarded, reason, category = 'bonus', awarded_by = null } = body;

    if (!user_id || points_awarded === undefined || !reason) {
      return NextResponse.json(
        { error: 'user_id, points_awarded, and reason are required' },
        { status: 400 }
      );
    }

    if (typeof points_awarded !== 'number' || isNaN(points_awarded) || points_awarded === 0) {
      return NextResponse.json(
        { error: 'points_awarded must be a non-zero number' },
        { status: 400 }
      );
    }

    if (!reason.trim()) {
      return NextResponse.json(
        { error: 'reason cannot be empty' },
        { status: 400 }
      );
    }

    const validCategories = ['legacy', 'bonus', 'correction', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('bonus_records')
      .insert({
        user_id,
        points_awarded,
        reason: reason.trim(),
        category,
        awarded_by,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data as BonusRecord, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create bonus record' },
      { status: 500 }
    );
  }
}
