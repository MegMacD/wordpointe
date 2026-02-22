import { NextRequest, NextResponse } from 'next/server';
import { fetchBibleVerse, validateBibleReference } from '@/lib/bible-api';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const version = searchParams.get('version');
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    // Validate reference format
    const validation = validateBibleReference(reference);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error || 'Invalid verse reference format' }, { status: 400 });
    }
    
    // Get preferred version from settings if not specified
    let bibleVersion = version || 'KJV';
    if (!version) {
      const supabase = getSupabaseAdmin();
      const { data: settings } = await supabase
        .from('settings')
        .select('bible_version')
        .limit(1)
        .single();
      
      if (settings?.bible_version) {
        bibleVersion = settings.bible_version;
      }
    }
    
    const verse = await fetchBibleVerse(reference, bibleVersion);
    
    if (!verse) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }
    
    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
