import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { User, UserSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSizeParam = searchParams.get('pageSize');
    const pageSize = pageSizeParam
      ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 20, 1), 100)
      : null;

    // Get users with points summary
    let query = supabase
      .from('user_points_summary')
      .select('*', { count: 'exact' });

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    let orderedQuery = query.order('name');

    if (pageSize !== null) {
      orderedQuery = orderedQuery.range((page - 1) * pageSize, page * pageSize - 1);
    }

    const { data, error, count } = await orderedQuery;

    if (error) {
      throw error;
    }

    const summaryItems = (data || []) as UserSummary[];
    let enrichedItems = summaryItems;

    if (summaryItems.length > 0) {
      const userIds = summaryItems.map((item) => item.id);
      const { data: authRows, error: authError } = await supabase
        .from('users')
        .select('id, password_hash')
        .in('id', userIds);

      if (!authError && authRows) {
        const loginAccessById = new Map(
          authRows.map((row: { id: string; password_hash: string | null }) => [row.id, !!row.password_hash])
        );
        enrichedItems = summaryItems.map((item) => ({
          ...item,
          hasLoginAccess: loginAccessById.get(item.id) ?? false,
        }));
      }
    }

    return NextResponse.json({
      items: enrichedItems,
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Only authenticated users can create users

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { name, is_leader = false, notes = null, legacy_points = null, emojiIcon = null, displayAccommodationNote = false } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate legacy_points if provided
    if (legacy_points !== null && (typeof legacy_points !== 'number' || isNaN(legacy_points))) {
      return NextResponse.json(
        { error: 'Legacy points must be a valid number' },
        { status: 400 }
      );
    }

    // Check for duplicate username (case-insensitive)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name')
      .ilike('name', name)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: `A user named "${existingUser.name}" already exists` },
        { status: 409 } // 409 Conflict
      );
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ name, is_leader, notes, emojiIcon, display_accommodation_note: displayAccommodationNote })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation from database as well
      if (error.code === '23505' || error.message?.includes('unique')) {
        return NextResponse.json(
          { error: 'A user with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    // If legacy points provided, create a bonus record
    if (legacy_points !== null && legacy_points !== 0) {
      const { error: bonusError } = await supabase
        .from('bonus_records')
        .insert({
          user_id: data.id,
          points_awarded: legacy_points,
          reason: 'Legacy points from previous system',
          category: 'legacy',
        });

      if (bonusError) {
        console.error('Failed to create legacy bonus record:', bonusError);
        // Don't fail the user creation if bonus record fails
        // The user is already created, just log the error
      }
    }

    return NextResponse.json(data as User, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

