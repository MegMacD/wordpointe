/**
 * Bible API Service
 * Fetches Bible verses from external APIs with caching
 * Supports multiple translations (NIV, ESV, KJV, etc.)
 */

interface BibleVerse {
  reference: string;
  text: string;
  version: string;
  copyright?: string;
}

interface BibleAPIConfig {
  apiKey?: string;
  version: string;
}

// Cache structure: { "John 3:16-NIV": { text, timestamp } }
const verseCache = new Map<string, { text: string; timestamp: number; copyright?: string }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Valid Bible books with common variations
 */
export const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', abbrev: ['Gen', 'Ge', 'Gn'] },
  { name: 'Exodus', abbrev: ['Exo', 'Ex', 'Exod'] },
  { name: 'Leviticus', abbrev: ['Lev', 'Le', 'Lv'] },
  { name: 'Numbers', abbrev: ['Num', 'Nu', 'Nm', 'Nb'] },
  { name: 'Deuteronomy', abbrev: ['Deut', 'Dt'] },
  { name: 'Joshua', abbrev: ['Josh', 'Jos', 'Jsh'] },
  { name: 'Judges', abbrev: ['Judg', 'Jdg', 'Jg', 'Jdgs'] },
  { name: 'Ruth', abbrev: ['Rth', 'Ru'] },
  { name: '1 Samuel', abbrev: ['1 Sam', '1 Sa', '1Samuel', '1S'] },
  { name: '2 Samuel', abbrev: ['2 Sam', '2 Sa', '2Samuel', '2S'] },
  { name: '1 Kings', abbrev: ['1 Kgs', '1 Ki', '1K'] },
  { name: '2 Kings', abbrev: ['2 Kgs', '2 Ki', '2K'] },
  { name: '1 Chronicles', abbrev: ['1 Chron', '1 Chr', '1Ch'] },
  { name: '2 Chronicles', abbrev: ['2 Chron', '2 Chr', '2Ch'] },
  { name: 'Ezra', abbrev: ['Ezr'] },
  { name: 'Nehemiah', abbrev: ['Neh', 'Ne'] },
  { name: 'Esther', abbrev: ['Esth', 'Es'] },
  { name: 'Job', abbrev: ['Jb'] },
  { name: 'Psalm', abbrev: ['Ps', 'Psalms', 'Pslm', 'Psa', 'Psm', 'Pss'] },
  { name: 'Proverbs', abbrev: ['Prov', 'Pro', 'Prv', 'Pr'] },
  { name: 'Ecclesiastes', abbrev: ['Eccles', 'Eccl', 'Ec', 'Qoh'] },
  { name: 'Song of Solomon', abbrev: ['Song', 'Song of Songs', 'SOS', 'SS', 'SongOfSongs'] },
  { name: 'Isaiah', abbrev: ['Isa', 'Is'] },
  { name: 'Jeremiah', abbrev: ['Jer', 'Je', 'Jr'] },
  { name: 'Lamentations', abbrev: ['Lam', 'La'] },
  { name: 'Ezekiel', abbrev: ['Ezek', 'Eze', 'Ezk'] },
  { name: 'Daniel', abbrev: ['Dan', 'Da', 'Dn'] },
  { name: 'Hosea', abbrev: ['Hos', 'Ho'] },
  { name: 'Joel', abbrev: ['Joe', 'Jl'] },
  { name: 'Amos', abbrev: ['Am'] },
  { name: 'Obadiah', abbrev: ['Obad', 'Ob'] },
  { name: 'Jonah', abbrev: ['Jnh', 'Jon'] },
  { name: 'Micah', abbrev: ['Mic', 'Mc'] },
  { name: 'Nahum', abbrev: ['Nah', 'Na'] },
  { name: 'Habakkuk', abbrev: ['Hab', 'Hb'] },
  { name: 'Zephaniah', abbrev: ['Zeph', 'Zep', 'Zp'] },
  { name: 'Haggai', abbrev: ['Hag', 'Hg'] },
  { name: 'Zechariah', abbrev: ['Zech', 'Zec', 'Zc'] },
  { name: 'Malachi', abbrev: ['Mal', 'Ml'] },
  // New Testament
  { name: 'Matthew', abbrev: ['Matt', 'Mt'] },
  { name: 'Mark', abbrev: ['Mrk', 'Mk', 'Mr'] },
  { name: 'Luke', abbrev: ['Luk', 'Lk'] },
  { name: 'John', abbrev: ['Jhn', 'Jn'] },
  { name: 'Acts', abbrev: ['Act', 'Ac'] },
  { name: 'Romans', abbrev: ['Rom', 'Ro', 'Rm'] },
  { name: '1 Corinthians', abbrev: ['1 Cor', '1 Co', '1Cor', '1Corinthians'] },
  { name: '2 Corinthians', abbrev: ['2 Cor', '2 Co', '2Cor', '2Corinthians'] },
  { name: 'Galatians', abbrev: ['Gal', 'Ga'] },
  { name: 'Ephesians', abbrev: ['Eph', 'Ephes'] },
  { name: 'Philippians', abbrev: ['Phil', 'Php', 'Pp'] },
  { name: 'Colossians', abbrev: ['Col', 'Co'] },
  { name: '1 Thessalonians', abbrev: ['1 Thess', '1 Th', '1Thess', '1Thessalonians'] },
  { name: '2 Thessalonians', abbrev: ['2 Thess', '2 Th', '2Thess', '2Thessalonians'] },
  { name: '1 Timothy', abbrev: ['1 Tim', '1 Ti', '1Tim', '1Timothy'] },
  { name: '2 Timothy', abbrev: ['2 Tim', '2 Ti', '2Tim', '2Timothy'] },
  { name: 'Titus', abbrev: ['Tit', 'Ti'] },
  { name: 'Philemon', abbrev: ['Phlm', 'Phm'] },
  { name: 'Hebrews', abbrev: ['Heb', 'He'] },
  { name: 'James', abbrev: ['Jas', 'Jm'] },
  { name: '1 Peter', abbrev: ['1 Pet', '1 Pe', '1Pet', '1P', '1Peter'] },
  { name: '2 Peter', abbrev: ['2 Pet', '2 Pe', '2Pet', '2P', '2Peter'] },
  { name: '1 John', abbrev: ['1 Jhn', '1 Jn', '1John', '1J'] },
  { name: '2 John', abbrev: ['2 Jhn', '2 Jn', '2John', '2J'] },
  { name: '3 John', abbrev: ['3 Jhn', '3 Jn', '3John', '3J'] },
  { name: 'Jude', abbrev: ['Jud', 'Jd'] },
  { name: 'Revelation', abbrev: ['Rev', 'Re', 'The Revelation'] }
];

/**
 * Validate a Bible reference format and book name
 * Note: This only validates format and book name, not if chapter/verse exists
 * Use validateBibleReferenceExists() to verify the verse actually exists in the Bible
 */
export function validateBibleReference(reference: string): { 
  isValid: boolean; 
  canonicalBook?: string; 
  normalized?: string;
  error?: string;
} {
  // Match patterns like "John 3:16" (single verse only)
  const match = reference.match(/^([1-3]?\s?[A-Za-z\s]+)\s+(\d+):(\d+)$/);
  
  if (!match) {
    return { 
      isValid: false, 
      error: 'Format should be like "John 3:16"' 
    };
  }
  
  const bookInput = match[1].trim();
  const chapter = match[2];
  const verse = match[3];
  
  // Find matching book
  const book = BIBLE_BOOKS.find(b => {
    const nameMatch = b.name.toLowerCase() === bookInput.toLowerCase();
    const abbrevMatch = b.abbrev.some(a => a.toLowerCase() === bookInput.toLowerCase());
    return nameMatch || abbrevMatch;
  });
  
  if (!book) {
    return { 
      isValid: false, 
      error: `"${bookInput}" is not a recognized Bible book` 
    };
  }
  
  const normalized = `${book.name} ${chapter}:${verse}`;
  
  return {
    isValid: true,
    canonicalBook: book.name,
    normalized
  };
}

/**
 * Validate that a Bible reference actually exists by attempting to fetch it
 * This is an async version that verifies the verse exists in the Bible
 */
export async function validateBibleReferenceExists(reference: string): Promise<{
  isValid: boolean;
  normalized?: string;
  error?: string;
}> {
  // First check format
  const formatCheck = validateBibleReference(reference);
  if (!formatCheck.isValid) {
    return formatCheck;
  }

  // Then verify verse exists by fetching from API
  try {
    const verse = await fetchBibleVerse(formatCheck.normalized!, 'ESV');
    if (!verse) {
      return {
        isValid: false,
        error: `${formatCheck.normalized} does not exist in the Bible`
      };
    }
    return {
      isValid: true,
      normalized: formatCheck.normalized
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to verify verse exists'
    };
  }
}

/**
 * Get autocomplete suggestions for Bible book names
 */
export function getBookSuggestions(input: string): string[] {
  if (!input || input.length < 2) return [];
  
  const lowercaseInput = input.toLowerCase();
  
  return BIBLE_BOOKS
    .filter(book => {
      const nameMatch = book.name.toLowerCase().startsWith(lowercaseInput);
      const abbrevMatch = book.abbrev.some(a => a.toLowerCase().startsWith(lowercaseInput));
      return nameMatch || abbrevMatch;
    })
    .map(book => book.name)
    .slice(0, 10); // Limit to 10 suggestions
}

/**
 * Parse Bible reference into components
 * Example: "John 3:16"
 */
function parseReference(reference: string): { book: string; chapter: number; verse: string } | null {
  // Match patterns like "John 3:16" (single verse only)
  const match = reference.match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  
  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: match[3]
  };
}

/**
 * Normalize book names for API calls
 */
function normalizeBookName(book: string): string {
  const bookMap: Record<string, string> = {
    '1 john': '1JN',
    '2 john': '2JN',
    '3 john': '3JN',
    '1 corinthians': '1CO',
    '2 corinthians': '2CO',
    '1 thessalonians': '1TH',
    '2 thessalonians': '2TH',
    '1 timothy': '1TI',
    '2 timothy': '2TI',
    '1 peter': '1PE',
    '2 peter': '2PE',
    '1 kings': '1KI',
    '2 kings': '2KI',
    '1 samuel': '1SA',
    '2 samuel': '2SA',
    '1 chronicles': '1CH',
    '2 chronicles': '2CH',
    'john': 'JHN',
    'genesis': 'GEN',
    'exodus': 'EXO',
    'leviticus': 'LEV',
    'numbers': 'NUM',
    'deuteronomy': 'DEU',
    'joshua': 'JOS',
    'judges': 'JDG',
    'ruth': 'RUT',
    'esther': 'EST',
    'job': 'JOB',
    'psalm': 'PSA',
    'psalms': 'PSA',
    'proverbs': 'PRO',
    'ecclesiastes': 'ECC',
    'song of solomon': 'SNG',
    'isaiah': 'ISA',
    'jeremiah': 'JER',
    'lamentations': 'LAM',
    'ezekiel': 'EZK',
    'daniel': 'DAN',
    'hosea': 'HOS',
    'joel': 'JOL',
    'amos': 'AMO',
    'obadiah': 'OBA',
    'jonah': 'JON',
    'micah': 'MIC',
    'nahum': 'NAM',
    'habakkuk': 'HAB',
    'zephaniah': 'ZEP',
    'haggai': 'HAG',
    'zechariah': 'ZEC',
    'malachi': 'MAL',
    'matthew': 'MAT',
    'mark': 'MRK',
    'luke': 'LUK',
    'acts': 'ACT',
    'romans': 'ROM',
    'galatians': 'GAL',
    'ephesians': 'EPH',
    'philippians': 'PHP',
    'colossians': 'COL',
    'titus': 'TIT',
    'philemon': 'PHM',
    'hebrews': 'HEB',
    'james': 'JAS',
    'jude': 'JUD',
    'revelation': 'REV'
  };
  
  return bookMap[book.toLowerCase()] || book.toUpperCase().substring(0, 3);
}

/**
 * Fetch verse from bible-api.com (free, no auth, KJV only)
 * Fallback option when API.Bible is unavailable
 */
async function fetchFromBibleAPI(reference: string): Promise<BibleVerse | null> {
  try {
    // bible-api.com uses natural references like "john 3:16"
    const encodedRef = encodeURIComponent(reference);
    const response = await fetch(`https://bible-api.com/${encodedRef}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data || !data.text) return null;
    
    return {
      reference: data.reference,
      text: data.text.trim(),
      version: 'KJV',
      copyright: 'King James Version (Public Domain)'
    };
  } catch (error) {
    console.error('Bible API error:', error);
    return null;
  }
}

/**
 * Fetch verse from API.Bible (requires API key, multiple versions)
 * Primary option for NIV, ESV, etc.
 */
async function fetchFromAPIBible(reference: string, version: string = 'KJV'): Promise<BibleVerse | null> {
  const apiKey = process.env.BIBLE_API_KEY;
  
  // If no API key, fall back to bible-api.com
  if (!apiKey) {
    return fetchFromBibleAPI(reference);
  }
  
  try {
    const parsed = parseReference(reference);
    if (!parsed) return null;
    
    const bookCode = normalizeBookName(parsed.book);
    const verseId = `${bookCode}.${parsed.chapter}.${parsed.verse}`;
    
    // Version IDs for API.Bible
    const versionMap: Record<string, string> = {
      'KJV': 'de4e12af7f28f599-02',  // King James Version
      'NIV': '06125adad2d5898a-01',  // New International Version (requires permission)
      'ESV': 'f421fe261da7624f-01',  // English Standard Version (requires permission)
      'NLT': '01b29f4b342acc35-01',  // New Living Translation (requires permission)
    };
    
    const bibleId = versionMap[version] || versionMap['KJV'];
    
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${verseId}`,
      {
        headers: {
          'api-key': apiKey
        }
      }
    );
    
    if (!response.ok) {
      // Fall back to bible-api.com
      return fetchFromBibleAPI(reference);
    }
    
    const data = await response.json();
    
    // Clean up HTML tags from verse text
    const text = data.data?.content
      ?.replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!text) {
      // If no text, fall back to bible-api.com
      return fetchFromBibleAPI(reference);
    }
    
    return {
      reference: data.data?.reference || reference,
      text: text || '',
      version: version,
      copyright: data.data?.copyright
    };
  } catch (error) {
    console.error('API.Bible error:', error);
    // Fall back to bible-api.com
    return fetchFromBibleAPI(reference);
  }
}

/**
 * Main function to fetch a Bible verse with caching
 */
export async function fetchBibleVerse(
  reference: string, 
  version: string = 'KJV'
): Promise<BibleVerse | null> {
  // Check cache first
  const cacheKey = `${reference}-${version}`;
  const cached = verseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      reference,
      text: cached.text,
      version,
      copyright: cached.copyright
    };
  }
  
  // Fetch from API
  const verse = await fetchFromAPIBible(reference, version);
  
  if (verse) {
    // Store in cache
    verseCache.set(cacheKey, {
      text: verse.text,
      timestamp: Date.now(),
      copyright: verse.copyright
    });
  }
  
  return verse;
}

/**
 * Batch fetch multiple verses (useful for preloading)
 */
export async function fetchBibleVerses(
  references: string[],
  version: string = 'KJV'
): Promise<Map<string, BibleVerse>> {
  const results = new Map<string, BibleVerse>();
  
  // Fetch in parallel but respect rate limits
  const chunks = [];
  for (let i = 0; i < references.length; i += 5) {
    chunks.push(references.slice(i, i + 5));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(ref => fetchBibleVerse(ref, version));
    const verses = await Promise.all(promises);
    
    verses.forEach((verse, index) => {
      if (verse) {
        results.set(chunk[index], verse);
      }
    });
    
    // Small delay between chunks to respect rate limits
    if (chunks.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Clear verse cache (useful for testing or manual refresh)
 */
export function clearVerseCache(): void {
  verseCache.clear();
}

/**
 * Validate if a reference looks like a Bible verse
 */
export function isValidReference(reference: string): boolean {
  return parseReference(reference) !== null;
}
