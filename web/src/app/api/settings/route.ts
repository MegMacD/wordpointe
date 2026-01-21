import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { Settings } from '@/lib/types';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get first (or create default) settings
    let { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      // Create default if none exists
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert({
          default_points_first: 10,
          default_points_repeat: 5,
          bible_version: 'KJV',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      data = newData;
    }

    return NextResponse.json(data as Settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(); // Only admins can update settings

    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // Get existing settings
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create
      const { data, error } = await supabase
        .from('settings')
        .insert({
          default_points_first: body.default_points_first ?? 10,
          default_points_repeat: body.default_points_repeat ?? 5,
          bible_version: body.bible_version ?? 'KJV',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    return NextResponse.json(result as Settings);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

