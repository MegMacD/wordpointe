/**
 * Test Bible API Endpoint
 * Quick test to verify the API endpoint is working
 * 
 * Usage: npm run test:api
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testAPI() {
  console.log('🔍 Testing Bible API Endpoint...\n');
  
  const apiKey = process.env.BIBLE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No BIBLE_API_KEY found in .env.local');
    console.log('   Set BIBLE_API_KEY in web/.env.local to test the API\n');
    console.log('   Without it, the app will fall back to bible-api.com (KJV only)');
    return;
  }
  
  console.log('✅ API key found\n');
  
  // Test with John 3:16 (NIV)
  const testReference = 'John 3:16';
  const bibleId = '9879dbb7cfe39e4d-01'; // NIV 2011
  const verseId = 'JHN.3.16';
  
  console.log(`Testing: ${testReference} (NIV)`);
  console.log(`Endpoint: https://rest.api.bible/v1/bibles/${bibleId}/verses/${verseId}\n`);
  
  try {
    const response = await fetch(
      `https://rest.api.bible/v1/bibles/${bibleId}/verses/${verseId}`,
      {
        headers: { 'api-key': apiKey }
      }
    );
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.log('Response:', errorBody);
      return;
    }
    
    const data = await response.json();
    
    // Clean up HTML tags and verse numbers from verse text
    const text = data.data?.content
      ?.replace(/<[^>]*>/g, '')  // Remove HTML tags
      .replace(/^\d+/g, '')       // Remove leading verse numbers
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
    
    console.log('✅ API Response Successful!\n');
    console.log('Reference:', data.data?.reference || testReference);
    console.log('Text:', text);
    console.log('\n🎉 The API endpoint is working correctly!');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('\nPossible issues:');
    console.log('- Check your internet connection');
    console.log('- Verify your BIBLE_API_KEY is valid');
    console.log('- The API might be temporarily unavailable');
  }
}

testAPI()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
