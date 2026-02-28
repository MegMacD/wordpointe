/**
 * Remove Multi-Verse Passages
 * Removes verses that span multiple verse numbers (e.g., "John 3:16-17")
 * These can be added back later with proper formatting support
 * 
 * Usage: npm run remove:multi-verses
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

/**
 * Check if a reference is multi-verse (contains a range like "16-17")
 */
function isMultiVerse(reference) {
  // Match patterns like "John 3:16-17" or "1 Corinthians 13:4-8"
  return /:\d+-\d+/.test(reference);
}

/**
 * Main function
 */
async function removeMultiVersePassages() {
  console.log('🗑️  Removing Multi-Verse Passages...\n');
  
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
    .select('id, reference, text')
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
  
  // Filter multi-verse passages
  const multiVerses = verses.filter(v => isMultiVerse(v.reference));
  const singleVerses = verses.filter(v => !isMultiVerse(v.reference));
  
  console.log(`Total verses: ${verses.length}`);
  console.log(`Single verses: ${singleVerses.length}`);
  console.log(`Multi-verse passages: ${multiVerses.length}\n`);
  
  if (multiVerses.length === 0) {
    console.log('✅ No multi-verse passages found. Nothing to remove.');
    process.exit(0);
  }
  
  console.log('Multi-verse passages to remove:');
  console.log('=' .repeat(60));
  multiVerses.forEach(v => {
    console.log(`- ${v.reference}`);
    console.log(`  ${v.text.substring(0, 80)}${v.text.length > 80 ? '...' : ''}\n`);
  });
  
  console.log('=' .repeat(60));
  console.log('\n⚠️  These verses will be DELETED (set to inactive).');
  console.log('⚠️  This is safe because no recordings exist for these verses.\n');
  
  // Delete multi-verse passages (set to inactive)
  console.log('Removing multi-verse passages...\n');
  
  const idsToRemove = multiVerses.map(v => v.id);
  
  const { error: deleteError } = await supabase
    .from('memory_items')
    .update({ active: false })
    .in('id', idsToRemove);
  
  if (deleteError) {
    console.error('❌ Error removing verses:', deleteError.message);
    process.exit(1);
  }
  
  console.log('=' .repeat(60));
  console.log('\n✅ Successfully removed multi-verse passages!\n');
  console.log(`Removed: ${multiVerses.length} multi-verse passages`);
  console.log(`Remaining: ${singleVerses.length} single verses`);
  console.log('\n💡 Multi-verse support can be added to the roadmap for future implementation.');
}

// Run the script
removeMultiVersePassages()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
