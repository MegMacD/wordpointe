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
      .from('spend_records')
      .select(`
        *,
        users(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spend record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch spend record' },
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
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Validate allowed fields for update
    const allowedFields = ['note', 'points_spent'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // If points_spent is being updated, we need to update user's points too
    let pointsDifference = 0;
    if ('points_spent' in updateData) {
      // Get current spend record
      const { data: currentRecord, error: currentError } = await supabase
        .from('spend_records')
        .select('points_spent, user_id')
        .eq('id', id)
        .single();

      if (currentError) {
        throw currentError;
      }

      pointsDifference = currentRecord.points_spent - updateData.points_spent;
    }

    const { data, error } = await supabase
      .from('spend_records')
      .update(updateData)
      .eq('id', id)
      .select('*, users(id, name, email)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spend record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Update user's points if needed
    if (pointsDifference !== 0) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', data.user_id)
        .single();

      if (!userError && user) {
        const newPoints = Math.max(0, user.points + pointsDifference);
        await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', data.user_id);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update spend record' },
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
      .from('spend_records')
      .select('user_id, points_spent, undone')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Spend record not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Check if already undone
    if (record.undone) {
      return NextResponse.json(
        { error: 'Spend record is already undone' },
        { status: 400 }
      );
    }

    // Delete the record
    const { error: deleteError } = await supabase
      .from('spend_records')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Restore the user's points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', record.user_id)
      .single();

    if (!userError && user) {
      const newPoints = user.points + record.points_spent;
      const { error: pointsError } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', record.user_id);

      if (pointsError) {
        console.error('Failed to restore user points after spend record deletion:', pointsError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete spend record' },
      { status: 500 }
    );
  }
}