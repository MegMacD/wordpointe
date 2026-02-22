import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth';
import { MemoryItem } from '@/lib/types';
import { validateBibleReference } from '@/lib/bible-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('memory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Memory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as MemoryItem);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memory item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(); // Only admins can update memory items

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // Get current item to check type if not provided in update
    let itemType = body.type;
    if (!itemType && body.reference) {
      const { data: currentItem } = await supabase
        .from('memory_items')
        .select('type')
        .eq('id', id)
        .single();
      itemType = currentItem?.type;
    }

    // Normalize reference if it's being updated and it's a verse
    if (body.reference && itemType === 'verse') {
      const validation = validateBibleReference(body.reference.trim());
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid verse reference format' },
          { status: 400 }
        );
      }
      body.reference = validation.normalized;
    }

    const { data, error } = await supabase
      .from('memory_items')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Memory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as MemoryItem);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update memory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(); // Only admins can delete memory items

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Check if this memory item has any records
    const { data: records, error: recordsError } = await supabase
      .from('verse_records')
      .select('id')
      .eq('memory_item_id', id)
      .limit(1);

    if (recordsError) {
      throw recordsError;
    }

    if (records && records.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete memory item that has associated records. Consider deactivating instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('memory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Memory item deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete memory item' },
      { status: 500 }
    );
  }
}

