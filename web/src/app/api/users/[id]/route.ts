import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { User, UserWithPoints } from '@/lib/types';
import { getCurrentPoints } from '@/lib/points';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const result: UserWithPoints = {
      ...(user as User),
      current_points: await getCurrentPoints(supabase, id),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(); // Only authenticated users can update

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // Only allow profile fields here. Auth fields (role/password_hash) should be
    // managed through explicit auth/account admin flows.
    const updateBody: Record<string, unknown> = {};

    if (typeof body.name === 'string') {
      updateBody.name = body.name;
    }

    if (typeof body.is_leader === 'boolean') {
      updateBody.is_leader = body.is_leader;
    }

    if (typeof body.notes === 'string' || body.notes === null) {
      updateBody.notes = body.notes;
    }

    if (typeof body.emojiIcon === 'string' || body.emojiIcon === null) {
      updateBody.emojiIcon = body.emojiIcon;
    }

    if (typeof body.displayAccommodationNote === 'boolean') {
      updateBody.display_accommodation_note = body.displayAccommodationNote;
    }

    if (Object.keys(updateBody).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateBody.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateBody)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as User);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Also support PUT method for compatibility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(); // Only authenticated users can delete

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

