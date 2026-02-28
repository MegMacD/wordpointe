/**
 * Seed Custom Verses with Specific Points
 * Fetches NIV text from Bible API and inserts with custom point values
 * Uses the EXACT same logic as creating verses through the UI
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
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

// Verses with custom points (all have repeat = 1)
const VERSES_TO_ADD = [
  { reference: '1 Corinthians 13:4-8', points: 15, repeat: 1 },
  { reference: '1 Corinthians 13:4', points: 5, repeat: 1 },
  { reference: '1 Corinthians 16:13-14', points: 5, repeat: 1 },
  { reference: '1 John 1:9', points: 5, repeat: 1 },
  { reference: '1 John 4:11', points: 5, repeat: 1 },
  { reference: '1 Peter 5:7', points: 5, repeat: 1 },
  { reference: '1 Timothy 1:17', points: 5, repeat: 1 },
  { reference: '1 Thessalonians 5:16-18', points: 5, repeat: 1 },
  { reference: '2 Corinthians 5:17', points: 5, repeat: 1 },
  { reference: '2 Timothy 1:7', points: 5, repeat: 1 },
  { reference: 'Deuteronomy 7:9', points: 5, repeat: 1 },
  { reference: 'Deuteronomy 31:6', points: 5, repeat: 1 },
  { reference: 'Deuteronomy 32:4', points: 5, repeat: 1 },
  { reference: 'Ephesians 2:10', points: 5, repeat: 1 },
  { reference: 'Ephesians 2:8-9', points: 5, repeat: 1 },
  { reference: 'Ephesians 4:2-3', points: 5, repeat: 1 },
  { reference: 'Ephesians 6:10-11', points: 10, repeat: 1 },
  { reference: 'Ephesians 6:12-13', points: 15, repeat: 1 },
  { reference: 'Ephesians 6:14-15', points: 10, repeat: 1 },
  { reference: 'Ephesians 6:16', points: 5, repeat: 1 },
  { reference: 'Ephesians 6:17-18', points: 10, repeat: 1 },
  { reference: 'Galatians 2:20', points: 5, repeat: 1 },
  { reference: 'Galatians 5:22-23', points: 10, repeat: 1 },
  { reference: 'Genesis 1:1', points: 5, repeat: 1 }, // Fixed typo from "Genesis 1:1 1"
  { reference: 'Hebrews 13:6', points: 5, repeat: 1 },
  { reference: 'Hebrews 13:8', points: 5, repeat: 1 },
  { reference: 'Isaiah 7:14', points: 5, repeat: 1 },
  { reference: 'Isaiah 26:3', points: 5, repeat: 1 },
  { reference: 'Isaiah 41:10', points: 5, repeat: 1 },
  { reference: 'James 1:17', points: 5, repeat: 1 },
  { reference: 'James 1:19', points: 5, repeat: 1 },
  { reference: 'James 1:2-4', points: 10, repeat: 1 }, // Fixed spacing from "James 1: 2-4"
  { reference: 'James 4:10', points: 5, repeat: 1 },
  { reference: 'Jeremiah 17:7', points: 5, repeat: 1 },
  { reference: 'Jeremiah 29:11', points: 5, repeat: 1 },
  { reference: 'John 1:14', points: 5, repeat: 1 },
  { reference: 'John 13:34-35', points: 10, repeat: 1 },
  { reference: 'John 14:6', points: 5, repeat: 1 },
  { reference: 'John 15:10-11', points: 10, repeat: 1 },
  { reference: 'John 15:4-5', points: 10, repeat: 1 },
  { reference: 'John 3:16', points: 5, repeat: 1 },
  { reference: 'John 8:12', points: 5, repeat: 1 },
  { reference: 'Joshua 1:9', points: 5, repeat: 1 },
  { reference: 'Luke 10:27', points: 5, repeat: 1 },
  { reference: 'Luke 2:8-14', points: 15, repeat: 1 },
  { reference: 'Matthew 6:33', points: 5, repeat: 1 },
  { reference: 'Matthew 11:28', points: 5, repeat: 1 },
  { reference: 'Matthew 22:37-39', points: 10, repeat: 1 },
  { reference: 'Matthew 28:19-20', points: 10, repeat: 1 },
  { reference: 'Philippians 1:6', points: 5, repeat: 1 },
  { reference: 'Philippians 2:3-4', points: 10, repeat: 1 },
  { reference: 'Philippians 4:12-13', points: 10, repeat: 1 },
  { reference: 'Philippians 4:6-7', points: 10, repeat: 1 },
  { reference: 'Philippians 4:8', points: 10, repeat: 1 },
  { reference: 'Proverbs 3:5-6', points: 5, repeat: 1 },
  { reference: 'Proverbs 30:5', points: 5, repeat: 1 },
  { reference: 'Psalm 107:1', points: 5, repeat: 1 },
  { reference: 'Psalm 113:3-5', points: 10, repeat: 1 },
  { reference: 'Psalm 119:105', points: 5, repeat: 1 },
  { reference: 'Psalm 139:4', points: 5, repeat: 1 },
  { reference: 'Psalm 145:8-10', points: 10, repeat: 1 },
  { reference: 'Psalm 18:2', points: 5, repeat: 1 },
  { reference: 'Psalm 31:14', points: 5, repeat: 1 },
  { reference: 'Psalm 34:14', points: 5, repeat: 1 },
  { reference: 'Psalm 55:22', points: 5, repeat: 1 },
  { reference: 'Psalm 66:1', points: 5, repeat: 1 },
  { reference: 'Psalm 95:1', points: 5, repeat: 1 },
  { reference: 'Revelation 1:8', points: 5, repeat: 1 },
  { reference: 'Romans 5:8', points: 5, repeat: 1 },
  { reference: 'Romans 6:23', points: 5, repeat: 1 },
  { reference: 'Romans 8:28', points: 5, repeat: 1 },
  { reference: 'Romans 15:13', points: 5, repeat: 1 },
];

/**
 * Fetch verse text from the Bible API
 */
async function fetchVerseFromAPI(reference, version = 'NIV') {
  try {
    const apiKey = process.env.BIBLE_API_KEY;
    
    if (!apiKey) {
      console.log('  ⚠️  No BIBLE_API_KEY found, falling back to bible-api.com (KJV only)');
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
    
    // Parse reference - handle both single verses and ranges
    const match = reference.match(/^([1-3]?\s?[A-Za-z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid reference format: ${reference}`);
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
      throw new Error(`API.Bible error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Clean up HTML tags and verse numbers from verse text
    const text = data.data?.content
      ?.replace(/<[^>]*>/g, '')  // Remove HTML tags
      .replace(/^\d+/g, '')       // Remove leading verse numbers
      .replace(/\s+/g, ' ')       // Normalize whitespace
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
 * Insert verse into database (same logic as UI)
 */
async function insertVerse(reference, text, version, pointsFirst, pointsRepeat) {
  try {
    // Check if verse already exists
    const { data: existing } = await supabase
      .from('memory_items')
      .select('id, active, points_first, points_repeat')
      .eq('reference', reference)
      .single();
    
    if (existing) {
      if (existing.active) {
        // Update points if different
        if (existing.points_first !== pointsFirst || existing.points_repeat !== pointsRepeat) {
          const { error } = await supabase
            .from('memory_items')
            .update({ 
              points_first: pointsFirst,
              points_repeat: pointsRepeat,
              text,
              bible_version: version
            })
            .eq('id', existing.id);
          
          if (error) throw error;
          console.log(`  🔄 ${reference} - Updated points (${pointsFirst}/${pointsRepeat})`);
          return { updated: true };
        }
        console.log(`  ⏭️  ${reference} - Already exists with correct points`);
        return { skipped: true };
      } else {
        // Reactivate inactive verse
        const { error } = await supabase
          .from('memory_items')
          .update({ 
            active: true,
            text,
            bible_version: version,
            points_first: pointsFirst,
            points_repeat: pointsRepeat
          })
          .eq('id', existing.id);
        
        if (error) throw error;
        console.log(`  ✅ ${reference} - Reactivated (${pointsFirst}/${pointsRepeat})`);
        return { reactivated: true };
      }
    }
    
    // Insert new verse
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
      });
    
    if (error) {
      if (error.code === '23505') {
        console.log(`  ⏭️  ${reference} - Already exists (created by another process)`);
        return { skipped: true };
      }
      throw error;
    }
    
    console.log(`  ✅ ${reference} - Created (${pointsFirst}/${pointsRepeat} points)`);
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
  console.log('🌱 Seeding Custom Verses with Specific Points...');
  console.log('Fetching NIV text from Bible API\n');
  console.log(`Total verses to add: ${VERSES_TO_ADD.length}\n`);
  
  // Check database connection
  try {
    const { error } = await supabase.from('memory_items').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  } catch (error) {
    console.error('❌ Cannot connect to database. Check your .env.local configuration.');
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
  
  const version = 'NIV';
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let reactivated = 0;
  let errors = 0;
  
  for (const verse of VERSES_TO_ADD) {
    console.log(`Fetching: ${verse.reference}...`);
    
    const verseData = await fetchVerseFromAPI(verse.reference, version);
    
    if (!verseData) {
      errors++;
      continue;
    }
    
    const result = await insertVerse(
      verse.reference, 
      verseData.text, 
      verseData.version,
      verse.points,
      verse.repeat
    );
    
    if (result.created) created++;
    if (result.updated) updated++;
    if (result.skipped) skipped++;
    if (result.reactivated) reactivated++;
    if (result.error) errors++;
    
    // Delay to avoid rate limiting (API.Bible free tier)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ Seeding Complete!\n');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already correct): ${skipped}`);
  console.log(`Reactivated: ${reactivated}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nTotal processed: ${created + updated + skipped + reactivated + errors}/${VERSES_TO_ADD.length}`);
  
  if (created > 0 || updated > 0) {
    console.log('\n💡 Verses are now available in the app with your custom points!');
  }
}

// Run the seeding
seedVerses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
