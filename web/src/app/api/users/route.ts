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
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);

    // Get users with points summary
    let query = supabase
      .from('user_points_summary')
      .select('*', { count: 'exact' });

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data, error, count } = await query
      .order('name')
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: (data || []) as UserSummary[],
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
    const { name, is_leader = false, notes = null, legacy_points = null } = body;

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
      .insert({ name, is_leader, notes })
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

