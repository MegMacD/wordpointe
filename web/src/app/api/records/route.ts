import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { computePoints } from '@/lib/points';
import { VerseRecord } from '@/lib/types';
import { fetchBibleVerse } from '@/lib/bible-api';

// Helper to calculate default points based on verse reference
function calculateDefaultPoints(reference: string): { first: number; repeat: number } {
  // Check if it's a range (e.g., "John 3:16-18" or "Psalm 23:1-6")
  const isRange = reference.includes('-') && reference.match(/\d+-\d+/);
  
  let basePoints = 10; // Default base points
  
  if (isRange) {
    const match = reference.match(/(\d+)-(\d+)/);
    if (match) {
      const verseCount = parseInt(match[2]) - parseInt(match[1]) + 1;
      basePoints = Math.min(10 + (verseCount * 2), 30); // Cap at 30
    }
  }
  
  return {
    first: basePoints,
    repeat: Math.ceil(basePoints / 2)
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const memoryItemId = searchParams.get('memory_item_id');
    const since = searchParams.get('since');

    let query = supabase
      .from('verse_records')
      .select(`
        *,
        users:user_id(id, name, is_leader),
        memory_items:memory_item_id(id, reference, type, text, points_first, points_repeat)
      `, { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (memoryItemId) {
      query = query.eq('memory_item_id', memoryItemId);
    }

    if (since) {
      query = query.gte('recorded_at', since);
    }

    const { data, error, count } = await query
      .order('recorded_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: (data || []) as VerseRecord[],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Only authenticated users (leaders) can record

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { user_id, memory_item_id, record_type } = body;

    if (!user_id || !memory_item_id || !record_type) {
      return NextResponse.json(
        { error: 'user_id, memory_item_id, and record_type are required' },
        { status: 400 }
      );
    }

    if (record_type !== 'first' && record_type !== 'repeat') {
      return NextResponse.json(
        { error: 'record_type must be "first" or "repeat"' },
        { status: 400 }
      );
    }

    // Check if first record already exists
    // Note: We'll check this properly after we resolve the memory_item_id to actual UUID
    let actualMemoryItemId = memory_item_id;
    
    // If it's not a UUID, we need to look up or create the item first to get its ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memory_item_id);
    
    if (!isUUID) {
      // Look up existing item by reference
      const { data: existingItem } = await supabase
        .from('memory_items')
        .select('id')
        .eq('reference', memory_item_id)
        .single();
      
      if (existingItem) {
        actualMemoryItemId = existingItem.id;
      }
    }
    
    if (record_type === 'first') {
      const { data: existing } = await supabase
        .from('verse_records')
        .select('id')
        .eq('user_id', user_id)
        .eq('memory_item_id', actualMemoryItemId)
        .eq('record_type', 'first')
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'First record already exists for this user and item' },
          { status: 409 }
        );
      }
    }

    // Get memory item to compute points (or create it if it doesn't exist)
    // First check if memory_item_id is a UUID or a reference string
    
    let memoryItem: { data: any; error: any } = { data: null, error: null };
    
    if (isUUID) {
      // It's a UUID, look it up normally
      memoryItem = await supabase
        .from('memory_items')
        .select('*')
        .eq('id', memory_item_id)
        .single();
    } else {
      // It's a reference string, look it up by reference
      memoryItem = await supabase
        .from('memory_items')
        .select('*')
        .eq('reference', memory_item_id)
        .single();
    }

    if (memoryItem.error || !memoryItem.data) {
      // Memory item doesn't exist - this might be a verse reference that needs to be created
      const reference = memory_item_id;
      // Check for inactive item with same reference
      const { data: inactiveItem } = await supabase
        .from('memory_items')
        .select('*')
        .eq('reference', reference)
        .eq('active', false)
        .single();
      if (inactiveItem) {
        // Reactivate the item
        const { data: reactivated, error: reactivateError } = await supabase
          .from('memory_items')
          .update({ active: true })
          .eq('id', inactiveItem.id)
          .select()
          .single();
        if (reactivateError) {
          return NextResponse.json(
            { error: 'Failed to reactivate memory item for verse' },
            { status: 500 }
          );
        }
        memoryItem.data = reactivated;
        memoryItem.error = null;
      } else {
        // Create new item
        console.log(`Memory item not found, attempting to create for reference: ${reference}`);
        // Fetch verse from Bible API (NIV only)
        const verseData = await fetchBibleVerse(reference, 'NIV');
        if (!verseData) {
          return NextResponse.json(
            { error: 'Memory item not found and could not fetch verse from API' },
            { status: 404 }
          );
        }
        // Calculate default points
        const points = calculateDefaultPoints(reference);
        // Create the memory item
        const { data: newItem, error: createError } = await supabase
          .from('memory_items')
          .insert({
            type: 'verse',
            reference: reference,
            text: verseData.text,
            points_first: points.first,
            points_repeat: points.repeat,
            active: true, // Auto-activate
            bible_version: 'NIV',
          })
          .select()
          .single();
        if (createError) {
          console.error('Failed to create memory item:', createError);
          return NextResponse.json(
            { error: 'Failed to create memory item for verse' },
            { status: 500 }
          );
        }
        console.log(`Created memory item for ${reference}`);
        memoryItem.data = newItem;
        memoryItem.error = null;
      }
    }

    // Compute points (server-side logic for flexibility)
    const { points_awarded, applied_multiplier, applied_promo } = computePoints(
      memoryItem.data as any,
      record_type
    );

    // Insert record - use the actual memory item ID
    const { data, error } = await supabase
      .from('verse_records')
      .insert({
        user_id,
        memory_item_id: memoryItem.data.id, // Use the actual UUID from the memory item
        record_type,
        points_awarded,
        applied_multiplier,
        applied_promo,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data as VerseRecord, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create record' },
      { status: 500 }
    );
  }
}

