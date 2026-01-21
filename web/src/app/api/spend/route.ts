import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { getCurrentPoints } from '@/lib/points';
import { SpendRecord } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const since = searchParams.get('since');
    const undone = searchParams.get('undone');

    let query = supabase
      .from('spend_records')
      .select(`
        *,
        users:user_id(id, name, is_leader)
      `, { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (since) {
      query = query.gte('spent_at', since);
    }

    if (undone !== null) {
      query = query.eq('undone', undone === 'true');
    }

    const { data, error, count } = await query
      .order('spent_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: (data || []) as SpendRecord[],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch spend records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Only authenticated users (leaders) can spend points

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { user_id, points_spent, note = null } = body;

    if (!user_id || !points_spent) {
      return NextResponse.json(
        { error: 'user_id and points_spent are required' },
        { status: 400 }
      );
    }

    if (typeof points_spent !== 'number' || points_spent <= 0) {
      return NextResponse.json(
        { error: 'points_spent must be a positive number' },
        { status: 400 }
      );
    }

    // Check current points (prevent overspend)
    const currentPoints = await getCurrentPoints(supabase, user_id);

    if (points_spent > currentPoints) {
      return NextResponse.json(
        { error: `Insufficient points. Current: ${currentPoints}, Requested: ${points_spent}` },
        { status: 400 }
      );
    }

    // Insert spend record
    const { data, error } = await supabase
      .from('spend_records')
      .insert({
        user_id,
        points_spent,
        note,
        undone: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data as SpendRecord, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create spend record' },
      { status: 500 }
    );
  }
}

