import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { MemoryItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const type = searchParams.get('type') as 'verse' | 'custom' | null;
    const q = searchParams.get('q') || '';

    let query = supabase
      .from('memory_items')
      .select('*', { count: 'exact' });

    if (active !== null) {
      query = query.eq('active', active === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (q) {
      query = query.or(`reference.ilike.%${q}%,text.ilike.%${q}%`);
    }

    const { data, error, count } = await query.order('reference');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: (data || []) as MemoryItem[],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(); // Only admins can create memory items

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const {
      type = 'verse',
      reference,
      text = null,
      points_first,
      points_repeat,
      active = true,
    } = body;

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Get default points from settings if not provided
    let finalPointsFirst = points_first;
    let finalPointsRepeat = points_repeat;

    if (finalPointsFirst === undefined || finalPointsRepeat === undefined) {
      const { data: settings } = await supabase
        .from('settings')
        .select('default_points_first, default_points_repeat')
        .single();

      if (settings) {
        finalPointsFirst = finalPointsFirst ?? settings.default_points_first;
        finalPointsRepeat = finalPointsRepeat ?? settings.default_points_repeat;
      } else {
        finalPointsFirst = finalPointsFirst ?? 10;
        finalPointsRepeat = finalPointsRepeat ?? 5;
      }
    }

    // Check for existing item (active or inactive)
    const { data: existingItem } = await supabase
      .from('memory_items')
      .select('*')
      .eq('reference', reference)
      .single();

    if (existingItem) {
      if (existingItem.active) {
        return NextResponse.json(
          { error: 'A memory item with this reference already exists and is active.' },
          { status: 409 }
        );
      } else {
        // Reactivate the item
        const { data: reactivated, error: reactivateError } = await supabase
          .from('memory_items')
          .update({
            active: true,
            text,
            points_first: finalPointsFirst,
            points_repeat: finalPointsRepeat,
          })
          .eq('id', existingItem.id)
          .select()
          .single();
        if (reactivateError) {
          throw reactivateError;
        }
        return NextResponse.json(reactivated as MemoryItem, { status: 200 });
      }
    }

    // No existing item, create new
    const { data, error } = await supabase
      .from('memory_items')
      .insert({
        type,
        reference,
        text,
        points_first: finalPointsFirst,
        points_repeat: finalPointsRepeat,
        active,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data as MemoryItem, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create memory item' },
      { status: 500 }
    );
  }
}

