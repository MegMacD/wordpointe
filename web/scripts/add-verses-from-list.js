/**
 * Add Verses from List
 * Adds verses from the verses file with specified point values (NIV)
 * 
 * Usage: npm run add:verses
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local from the web directory
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

// Verses to add with their point values
const VERSES_TO_ADD = [
  { reference: '1 Corinthians 13:4-8', firstPoints: 15, repeatPoints: 3 },
  { reference: '1 Corinthians 13:4', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 Corinthians 16:13-14', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 John 1:9', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 John 4:11', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 Peter 5:7', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 Timothy 1:17', firstPoints: 5, repeatPoints: 1 },
  { reference: '1 Thessalonians 5:16-18', firstPoints: 5, repeatPoints: 1 },
  { reference: '2 Corinthians 5:17', firstPoints: 5, repeatPoints: 1 },
  { reference: '2 Timothy 1:7', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Deuteronomy 7:9', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Deuteronomy 31:6', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Deuteronomy 32:4', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Ephesians 2:10', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Ephesians 2:8-9', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Ephesians 4:2-3', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Ephesians 6:10-11', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Ephesians 6:12-13', firstPoints: 15, repeatPoints: 3 },
  { reference: 'Ephesians 6:14-15', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Ephesians 6:16', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Ephesians 6:17-18', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Galatians 2:20', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Galatians 5:22-23', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Genesis 1:1', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Hebrews 13:6', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Hebrews 13:8', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Isaiah 7:14', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Isaiah 26:3', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Isaiah 41:10', firstPoints: 5, repeatPoints: 1 },
  { reference: 'James 1:17', firstPoints: 5, repeatPoints: 1 },
  { reference: 'James 1:19', firstPoints: 5, repeatPoints: 1 },
  { reference: 'James 1:2-4', firstPoints: 10, repeatPoints: 2 },
  { reference: 'James 4:10', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Jeremiah 17:7', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Jeremiah 29:11', firstPoints: 5, repeatPoints: 1 },
  { reference: 'John 1:14', firstPoints: 5, repeatPoints: 1 },
  { reference: 'John 13:34-35', firstPoints: 10, repeatPoints: 2 },
  { reference: 'John 14:6', firstPoints: 5, repeatPoints: 1 },
  { reference: 'John 15:10-11', firstPoints: 10, repeatPoints: 2 },
  { reference: 'John 15:4-5', firstPoints: 10, repeatPoints: 1 },
  { reference: 'John 3:16', firstPoints: 5, repeatPoints: 1 },
  { reference: 'John 8:12', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Joshua 1:9', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Luke 10:27', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Luke 2:8-14', firstPoints: 15, repeatPoints: 1 },
  { reference: 'Matthew 6:33', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Matthew 11:28', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Matthew 22:37-39', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Matthew 28:19-20', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Philippians 1:6', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Philippians 2:3-4', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Philippians 4:12-13', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Philippians 4:6-7', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Philippians 4:8', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Proverbs 3:5-6', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Proverbs 30:5', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 107:1', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 113:3-5', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Psalm 119:105', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 139:4', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 145:8-10', firstPoints: 10, repeatPoints: 2 },
  { reference: 'Psalm 18:2', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 31:14', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 34:14', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 55:22', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 66:1', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Psalm 95:1', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Revelation 1:8', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Romans 5:8', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Romans 6:23', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Romans 8:28', firstPoints: 5, repeatPoints: 1 },
  { reference: 'Romans 15:13', firstPoints: 5, repeatPoints: 1 },
];

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
    
    const bibleId = '9879dbb7cfe39e4d-01'; // NIV 2011
    
    // Parse reference to get book, chapter, verse(s)
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
 * Main function
 */
async function addVerses() {
  console.log('📖 Adding Verses from List (NIV)...\n');
  
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
  
  // Get existing verses
  console.log('Checking existing verses...\n');
  
  const { data: existingVerses, error: fetchError } = await supabase
    .from('memory_items')
    .select('reference')
    .eq('type', 'verse')
    .eq('active', true);
  
  if (fetchError) {
    console.error('❌ Error fetching existing verses:', fetchError.message);
    process.exit(1);
  }
  
  const existingRefs = new Set(existingVerses.map(v => v.reference));
  
  // Find verses to add
  const versesToAdd = VERSES_TO_ADD.filter(v => !existingRefs.has(v.reference));
  const alreadyExists = VERSES_TO_ADD.filter(v => existingRefs.has(v.reference));
  
  console.log(`Total in list: ${VERSES_TO_ADD.length}`);
  console.log(`Already in database: ${alreadyExists.length}`);
  console.log(`New verses to add: ${versesToAdd.length}\n`);
  
  if (alreadyExists.length > 0) {
    console.log('Already exists (skipping):');
    alreadyExists.forEach(v => console.log(`  - ${v.reference}`));
    console.log('');
  }
  
  if (versesToAdd.length === 0) {
    console.log('✅ All verses already in database. Nothing to add.');
    process.exit(0);
  }
  
  console.log('Adding new verses...');
  console.log('=' .repeat(60));
  
  let added = 0;
  let failed = 0;
  
  for (const verse of versesToAdd) {
    console.log(`\n${verse.reference} (${verse.firstPoints}/${verse.repeatPoints} points)`);
    
    // Fetch NIV text
    const text = await fetchNIVVerse(verse.reference);
    
    if (!text) {
      console.log('  ❌ Failed to fetch - skipping');
      failed++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    console.log(`  Text: ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`);
    
    // Insert into database
    const { error: insertError } = await supabase
      .from('memory_items')
      .insert({
        type: 'verse',
        reference: verse.reference,
        text: text,
        bible_version: 'NIV',
        points_first: verse.firstPoints,
        points_repeat: verse.repeatPoints,
        active: true
      });
    
    if (insertError) {
      console.log(`  ❌ Database error: ${insertError.message}`);
      failed++;
    } else {
      console.log('  ✅ Added successfully');
      added++;
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✨ Complete!\n');
  console.log(`Added: ${added}`);
  console.log(`Failed: ${failed}`);
  console.log(`Already existed: ${alreadyExists.length}`);
  console.log(`\nTotal verses now in database: ${existingVerses.length + added}`);
}

// Run the script
addVerses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
