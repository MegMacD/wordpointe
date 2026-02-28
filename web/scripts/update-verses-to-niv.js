/**
 * Update Existing Verses to NIV
 * Updates verse text to NIV while preserving all recordings and relationships
 * 
 * This is a ONE-TIME migration script that:
 * - Fetches all active verses from the database
 * - Gets NIV text from the Bible API
 * - Updates ONLY the text and bible_version fields
 * - Preserves ALL other data (ID, points, recordings, etc.)
 * 
 * Usage: npm run update:verses-niv
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fetch verse text from the Bible API (NIV)
 */
async function fetchNIVVerse(reference) {
  try {
    const apiKey = process.env.BIBLE_API_KEY;
    
    if (!apiKey) {
      console.log('  ⚠️  No BIBLE_API_KEY found - cannot fetch NIV');
      return null;
    }
    
    // Use API.Bible for NIV
    // Note: You may need to verify the correct Bible ID for NIV from https://rest.api.bible/v1/bibles
    // Common IDs: '9879dbb7cfe39e4d-01' (NIV 2011), 'de4e12af7f28f599-02' (KJV)
    const bibleId = '9879dbb7cfe39e4d-01'; // NIV 2011
    
    // Parse reference to get book, chapter, verse
    const match = reference.match(/^([1-3]?\s?[A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) {
      console.log(`  ⚠️  Invalid reference format: ${reference}`);
      return null;
    }
    
    const [, book, chapter, startVerse, endVerse] = match;
    
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
    const verseId = endVerse 
      ? `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`
      : `${bookCode}.${chapter}.${startVerse}`;
    
    const response = await fetch(
      `https://rest.api.bible/v1/bibles/${bibleId}/verses/${verseId}`,
      {
        headers: { 'api-key': apiKey }
      }
    );
    
    if (!response.ok) {
      console.log(`  ⚠️  API error: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Clean up HTML tags, verse numbers, and extra text
    const text = data.data?.content
      ?.replace(/<[^>]*>/g, '')           // Remove HTML tags
      .replace(/^[\d\s]+/, '')           // Remove leading verse numbers and spaces
      .replace(/BOOK \d+/g, '')           // Remove "BOOK 5" type labels
      .replace(/For the Chief Musician[^.]*\./g, '')  // Remove psalm headers
      .replace(/A Psalm[^.]*\./g, '')     // Remove psalm type labels
      .replace(/A Song[^.]*\./g, '')      // Remove song labels
      .replace(/\s+/g, ' ')                // Normalize whitespace
      .trim();
    
    if (!text) {
      console.log(`  ⚠️  No text returned from API`);
      return null;
    }
    
    return text;
  } catch (error) {
    console.error(`  ❌ Error fetching: ${error.message}`);
    return null;
  }
}

/**
 * Update a single verse to NIV
 */
async function updateVerseToNIV(verse) {
  const { id, reference, text: currentText, bible_version } = verse;
  
  console.log(`\nProcessing: ${reference}`);
  console.log(`  Current version: ${bible_version || 'Unknown'}`);
  
  // FORCE UPDATE: Commenting out skip check to update all verses
  // if (bible_version === 'NIV') {
  //   console.log(`  ⏭️  Already NIV - skipping`);
  //   return { skipped: true };
  // }
  
  // Fetch NIV text
  const nivText = await fetchNIVVerse(reference);
  
  if (!nivText) {
    console.log(`  ⏭️  Could not fetch NIV - keeping current text`);
    return { failed: true };
  }
  
  // Show text comparison
  console.log(`  Old text: ${currentText.substring(0, 80)}${currentText.length > 80 ? '...' : ''}`);
  console.log(`  New text: ${nivText.substring(0, 80)}${nivText.length > 80 ? '...' : ''}`);
  
  // Update the verse
  const { error } = await supabase
    .from('memory_items')
    .update({
      text: nivText,
      bible_version: 'NIV'
      // updated_at is automatically set by database trigger
    })
    .eq('id', id);
  
  if (error) {
    console.error(`  ❌ Update failed: ${error.message}`);
    return { error: true };
  }
  
  console.log(`  ✅ Updated to NIV`);
  return { updated: true };
}

/**
 * Main update function
 */
async function updateVersesToNIV() {
  console.log('📝 Updating Existing Verses to NIV...');
  console.log('This will preserve all recordings, points, and relationships\n');
  
  // Check database connection
  try {
    const { data: test, error } = await supabase
      .from('memory_items')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('❌ Cannot connect to database. Check your .env.local configuration.');
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
  
  // Fetch all active verses
  console.log('Fetching all active verses from database...\n');
  
  const { data: verses, error: fetchError } = await supabase
    .from('memory_items')
    .select('id, reference, text, bible_version')
    .eq('type', 'verse')
    .eq('active', true)
    .order('reference');
  
  if (fetchError) {
    console.error('❌ Error fetching verses:', fetchError.message);
    process.exit(1);
  }
  
  if (!verses || verses.length === 0) {
    console.log('No verses found in database.');
    process.exit(0);
  }
  
  console.log(`Found ${verses.length} active verses\n`);
  console.log('Starting update process...');
  console.log('=' .repeat(60));
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let errors = 0;
  
  for (const verse of verses) {
    const result = await updateVerseToNIV(verse);
    
    if (result.updated) updated++;
    if (result.skipped) skipped++;
    if (result.failed) failed++;
    if (result.error) errors++;
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✨ Update Complete!\n');
  console.log(`Updated to NIV: ${updated}`);
  console.log(`Already NIV (skipped): ${skipped}`);
  console.log(`Could not fetch (kept existing): ${failed}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nTotal processed: ${updated + skipped + failed + errors}/${verses.length}`);
  
  if (updated > 0) {
    console.log('\n💡 All user recordings and points are preserved!');
    console.log('💡 You can verify the changes in your app.');
  }
}

// Run the update
updateVersesToNIV()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
