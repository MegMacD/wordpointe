/**
 * Seed Common Verses from Bible API
 * Populates common Sunday School memory verses with NIV text fetched from the API
 * 
 * This uses the EXACT same logic as creating verses through the UI:
 * - Normalizes references the same way
 * - Uses the same default points from settings
 * - Uses the same database fields
 * - Handles duplicates the same way (reactivate if inactive)
 * 
 * Usage: npm run seed:verses
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local from the web directory (one level up from scripts/)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in web/.env.local');
  console.error(`Looking for .env.local at: ${path.join(__dirname, '..', '.env.local')}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Common verses to seed - organized by category
const COMMON_VERSES = [
  // Gospel Verses
  'John 3:16',
  'Romans 3:23',
  'Romans 6:23',
  'Romans 5:8',
  'Romans 10:9',
  'Ephesians 2:10',
  'John 1:12',
  'John 14:6',
  '1 John 1:9',
  '2 Corinthians 5:17',
  
  // Encouragement & Trust
  'Philippians 4:13',
  'Jeremiah 29:11',
  'Isaiah 40:31',
  'Joshua 1:9',
  'Psalm 46:1',
  '1 Peter 5:7',
  '2 Timothy 1:7',
  
  // Psalms
  'Psalm 23:1',
  'Psalm 119:11',
  'Psalm 139:14',
  'Psalm 118:24',
  'Psalm 56:3',
  
  // Love & Obedience
  'John 13:34',
  '1 John 4:19',
  '1 John 4:11',
  'Colossians 3:23',
  '1 Corinthians 10:31',
  
  // God's Word
  '2 Timothy 3:16',
  
  // Faith & Faithfulness
  '1 Timothy 1:17',
  
  // Christmas
  'John 1:14',
  
  // Note: Multi-verse passages removed - single verses only for now
  // Kids can add them on-the-fly when recording if they want
];

/**
 * Fetch verse text from the Bible API
 */
async function fetchVerseFromAPI(reference, version = 'NIV') {
  try {
    const apiKey = process.env.BIBLE_API_KEY;
    
    if (!apiKey) {
      console.log('  ⚠️  No BIBLE_API_KEY found, falling back to bible-api.com (KJV only)');
      // Use free bible-api.com (KJV only)
      const encodedRef = encodeURIComponent(reference);
      const response = await fetch(`https://bible-api.com/${encodedRef}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        text: data.text?.trim(),
        version: 'KJV',
        reference: data.reference
      };
    }
    
    // Use API.Bible for NIV
    const versionMap = {
      'NIV': '06125adad2d5898a-01',
      'ESV': 'f421fe261da7624f-01',
      'KJV': 'de4e12af7f28f599-02',
    };
    
    const bibleId = versionMap[version] || versionMap['NIV'];
    
    // Parse reference to get book, chapter, verse
    const match = reference.match(/^([1-3]?\s?[A-Za-z\s]+)\s+(\d+):(\d+)$/);
    if (!match) {
      throw new Error(`Invalid reference format: ${reference}`);
    }
    
    const [, book, chapter, verse] = match;
    
    // Normalize book name for API
    const bookMap = {
      'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM',
      'deuteronomy': 'DEU', 'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT',
      '1 samuel': '1SA', '2 samuel': '2SA', '1 kings': '1KI', '2 kings': '2KI',
      '1 chronicles': '1CH', '2 chronicles': '2CH', 'ezra': 'EZR', 'nehemiah': 'NEH',
      'esther': 'EST', 'job': 'JOB', 'psalm': 'PSA', 'psalms': 'PSA',
      'proverbs': 'PRO', 'ecclesiastes': 'ECC', 'song of solomon': 'SNG',
      'isaiah': 'ISA', 'jeremiah': 'JER', 'lamentations': 'LAM', 'ezekiel': 'EZK',
      'daniel': 'DAN', 'hosea': 'HOS', 'joel': 'JOL', 'amos': 'AMO',
      'obadiah': 'OBA', 'jonah': 'JON', 'micah': 'MIC', 'nahum': 'NAM',
      'habakkuk': 'HAB', 'zephaniah': 'ZEP', 'haggai': 'HAG', 'zechariah': 'ZEC',
      'malachi': 'MAL', 'matthew': 'MAT', 'mark': 'MRK', 'luke': 'LUK',
      'john': 'JHN', 'acts': 'ACT', 'romans': 'ROM',
      '1 corinthians': '1CO', '2 corinthians': '2CO', 'galatians': 'GAL',
      'ephesians': 'EPH', 'philippians': 'PHP', 'colossians': 'COL',
      '1 thessalonians': '1TH', '2 thessalonians': '2TH',
      '1 timothy': '1TI', '2 timothy': '2TI', 'titus': 'TIT',
      'philemon': 'PHM', 'hebrews': 'HEB', 'james': 'JAS',
      '1 peter': '1PE', '2 peter': '2PE', '1 john': '1JN',
      '2 john': '2JN', '3 john': '3JN', 'jude': 'JUD', 'revelation': 'REV'
    };
    
    const bookCode = bookMap[book.toLowerCase()] || book.toUpperCase().substring(0, 3);
    const verseId = `${bookCode}.${chapter}.${verse}`;
    
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseId}`,
      {
        headers: { 'api-key': apiKey }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API.Bible error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Clean up HTML tags from verse text
    const text = data.data?.content
      ?.replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!text) {
      throw new Error('No text returned from API');
    }
    
    return {
      text,
      version,
      reference: data.data?.reference || reference
    };
  } catch (error) {
    console.error(`  ❌ Error fetching ${reference}: ${error.message}`);
    return null;
  }
}

/**
 * Insert verse into database using the SAME logic as the UI
 * This matches the POST /api/memory-items endpoint exactly
 */
async function insertVerse(reference, text, version) {
  try {
    // Step 1: Check if verse already exists (same as UI)
    const { data: existing } = await supabase
      .from('memory_items')
      .select('id, active, text, bible_version')
      .eq('reference', reference)
      .single();
    
    if (existing) {
      if (existing.active) {
        console.log(`  ⏭️  ${reference} - Already exists (active)`);
        return { skipped: true };
      } else {
        // Step 2: Reactivate inactive verse (same as UI reactivation logic)
        const { error } = await supabase
          .from('memory_items')
          .update({ 
            active: true,
            text,
            bible_version: version
            // updated_at is automatically set by database trigger
          })
          .eq('id', existing.id);
        
        if (error) throw error;
        console.log(`  ✅ ${reference} - Reactivated with ${version} text`);
        return { reactivated: true };
      }
    }
    
    // Step 3: Get default points from settings (same as UI)
    const { data: settings } = await supabase
      .from('settings')
      .select('default_points_first, default_points_repeat')
      .single();
    
    const pointsFirst = settings?.default_points_first ?? 10;
    const pointsRepeat = settings?.default_points_repeat ?? 5;
    
    // Step 4: Insert new verse (same fields as UI)
    const { error } = await supabase
      .from('memory_items')
      .insert({
        type: 'verse',
        reference,
        text,
        points_first: pointsFirst,
        points_repeat: pointsRepeat,
        active: true,
        bible_version: version
        // id, created_at, updated_at are automatically set by database
      });
    
    if (error) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        console.log(`  ⏭️  ${reference} - Already exists (created by another process)`);
        return { skipped: true };
      }
      throw error;
    }
    
    console.log(`  ✅ ${reference} - Created with ${version} text (${pointsFirst}/${pointsRepeat} points)`);
    return { created: true };
  } catch (error) {
    console.error(`  ❌ ${reference} - Error: ${error.message}`);
    return { error: true };
  }
}

/**
 * Main seeding function
 */
async function seedVerses() {
  console.log('🌱 Seeding Common Verses from Bible API...');
  console.log('This uses the same logic as creating verses through the UI\n');
  console.log(`Total verses to seed: ${COMMON_VERSES.length}\n`);
  
  // Check database connection first
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('default_points_first, default_points_repeat')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is ok
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    console.log(`Default points from settings: ${settings?.default_points_first ?? 10} first / ${settings?.default_points_repeat ?? 5} repeat\n`);
  } catch (error) {
    console.error('❌ Cannot connect to database. Check your .env.local configuration.');
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
  
  const version = 'NIV';
  let created = 0;
  let skipped = 0;
  let reactivated = 0;
  let errors = 0;
  
  for (const reference of COMMON_VERSES) {
    console.log(`Fetching: ${reference}...`);
    
    const verseData = await fetchVerseFromAPI(reference, version);
    
    if (!verseData) {
      errors++;
      continue;
    }
    
    const result = await insertVerse(reference, verseData.text, verseData.version);
    
    if (result.created) created++;
    if (result.skipped) skipped++;
    if (result.reactivated) reactivated++;
    if (result.error) errors++;
    
    // Delay to avoid rate limiting (API.Bible free tier)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ Seeding Complete!\n');
  console.log(`Created: ${created}`);
  console.log(`Skipped (already active): ${skipped}`);
  console.log(`Reactivated: ${reactivated}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nTotal processed: ${created + skipped + reactivated + errors}/${COMMON_VERSES.length}`);
  
  if (created > 0) {
    console.log('\n💡 Tip: These verses are now available in the app just like user-created verses!');
  }
}

// Run the seeding
seedVerses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
