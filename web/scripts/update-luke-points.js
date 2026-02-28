/**
 * Update Point Values for Luke 2:8-14
 * Quick script to update point values for a specific verse
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePoints() {
  console.log('Updating point values for Luke 2:8-14...\n');
  
  const { data, error } = await supabase
    .from('memory_items')
    .update({
      points_first: 15,
      points_repeat: 3
    })
    .eq('reference', 'Luke 2:8-14')
    .eq('type', 'verse')
    .select();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (data && data.length > 0) {
    console.log('✅ Updated successfully!');
    console.log(`\nLuke 2:8-14:`);
    console.log(`  First recording: ${data[0].points_first} points`);
    console.log(`  Repeat: ${data[0].points_repeat} points`);
  } else {
    console.log('⚠️  Verse not found in database');
  }
}

updatePoints()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
