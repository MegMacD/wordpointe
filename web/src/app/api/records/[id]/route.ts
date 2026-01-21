import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('verse_records')
      .select(`
        *,
        memory_items(id, reference, text, type),
        users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;
    
    // Verse records don't have editable fields, so this endpoint just returns the record
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('verse_records')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    // Get the record first to check if it exists and get user info
    const { data: record, error: fetchError } = await supabase
      .from('verse_records')
      .select('user_id, points_earned')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete the record
    const { error: deleteError } = await supabase
      .from('verse_records')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Update the user's points (subtract the points that were earned)
    // First get current points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', record.user_id)
      .single();

    if (!userError && user) {
      const newPoints = Math.max(0, user.points - record.points_earned);
      const { error: pointsError } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', record.user_id);

      if (pointsError) {
        console.error('Failed to update user points after record deletion:', pointsError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete record' },
      { status: 500 }
    );
  }
}