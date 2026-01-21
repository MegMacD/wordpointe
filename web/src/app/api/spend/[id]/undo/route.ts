import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { SpendRecord } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(); // Only authenticated users (leaders) can undo

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Get current record
    const { data: record, error: fetchError } = await supabase
      .from('spend_records')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Spend record not found' },
        { status: 404 }
      );
    }

    if (record.undone) {
      return NextResponse.json(
        { error: 'Record already undone' },
        { status: 400 }
      );
    }

    // Mark as undone
    const { data, error } = await supabase
      .from('spend_records')
      .update({ undone: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data as SpendRecord);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to undo spend record' },
      { status: 500 }
    );
  }
}

