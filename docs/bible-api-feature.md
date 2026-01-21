# Bible Verse Auto-Fetch Feature

## Overview
Word Pointe automatically fetches and stores Bible verse text from external APIs. When you record a verse for the first time, the app fetches the text from the Bible API and saves it to the database for future use.

## How It Works

### 1. **On-Demand Creation**
- First time a verse is recorded, the app automatically:
  - Fetches the verse text from the API
  - Creates a new memory item with the verse text
  - Sets the item as **active** so it's immediately available
  - Calculates default points (10 base + 2 per verse in range, capped at 30)
  - Uses **ESV** (English Standard Version) as the single version
- Subsequent recordings use the saved memory item
- Database grows organically based on actual usage

### 2. **Bible API Sources**
- **Primary**: bible-api.com (free, no auth, KJV) - used for reference parsing
- **ESV API**: API.Bible with ESV version - used for verse text

### 3. **Caching**
- Fetched verses are cached for 7 days to reduce API calls
- Cache is stored in memory (could be moved to database if needed)
- Improves performance and reduces external dependencies

## Setup

### Required Setup
1. Get a free API key from https://scripture.api.bible
2. Add to your `.env.local`:
   ```
   BIBLE_API_KEY=your_api_key_here
   ```
3. The app uses ESV by default - no version selection needed

## Features

### For Admins
## Features

### For Admins
- **Memory Items**: View all verses that have been auto-created
- **Manual Override**: Can edit verse text for specific translations if needed
- **Active by Default**: All auto-created verses are immediately active

### For Leaders
- **Auto-Creation**: Just record a verse reference - the app handles the rest
- **Seamless Experience**: Verse text is fetched and saved automatically
- **No Pre-Loading**: Database only contains verses you've actually used
| Version | Name | Availability |
## Bible Version

The app uses **ESV (English Standard Version)** as the single version to prevent confusion with mixed translations in the database. If you need a different translation for a specific verse, you can manually edit the text in the Admin → Memory Items page.
### Get Verse Text
```
GET /api/bible/verse?reference=John+3:16&version=KJV
```

Response:
```json
{
  "reference": "John 3:16",
  "text": "For God so loved the world...",
  "version": "KJV",
  "copyright": "King James Version (Public Domain)"
}
```

## Technical Details

### Reference Parsing
Supports formats like:
- `John 3:16`
- `1 John 2:15`
- `Psalm 23:1-6`
- `Genesis 1:1-3`

### Book Name Normalization
Automatically converts book names to API codes:
- "John" → "JHN"
- "1 Corinthians" → "1CO"
- "Psalms" → "PSA"

### Error Handling
- Falls back to bible-api.com if API.Bible fails
- Returns null if verse not found
- Shows "Auto-fetched from Bible API" indicator
- Manual text entries always work regardless of API status

## Future Enhancements

### Planned Features
- [ ] Version switcher on Record page (quick toggle between KJV/NIV/ESV)
- [ ] Bulk pre-fetch for common verses
## Default Point Calculation

When a verse is auto-created, points are calculated as:
- **Base**: 10 points
- **Range Bonus**: +2 points per verse for ranges (e.g., Psalm 23:1-6 = 10 + 12 = 22)
- **Cap**: Maximum 30 points
- **Repeat**: Half of first-time points

Examples:
- John 3:16 → 10 points (single verse)
- Psalm 23:1-6 → 22 points (6-verse range)
- Genesis 1:1-31 → 30 points (capped at 30)

Admins can adjust these values manually in Memory Items if needed.

## Maintaining Existing Functionality

✅ **All existing features preserved:**
- Custom point values per memory item
- Manual text entry for any memory item
- Audit trail (verse_records) unchanged
- Admin controls unchanged
- Leader workflow unchanged

✅ **What's different:**
- Verses are auto-created when first recorded
- All auto-created verses are immediately active
- Database grows organically based on usage
- Single ESV version prevents translation confusion

## Future Enhancements

### Potential Features
- [ ] Support for other Bible versions (NIV, NLT, etc.)
- [ ] Verse text preview before recording
- [ ] Offline mode with cached verses

## Troubleshooting

### Verse Not Auto-Creating
1. Check if reference format is correct (e.g., "John 3:16")
2. Verify internet connection
3. Check if BIBLE_API_KEY is set in .env.local
4. Look for errors in the browser console
5. Manually add the verse in Admin → Memory Items if needed

### Wrong Translation
1. Edit the memory item in Admin → Memory Items
2. Update the text field with your preferred translation
3. Manual edits are preserved

### API Rate Limits
- API.Bible: 1000 requests/day on free tier
- Caching reduces API calls significantly (verses are fetched once then stored)
- Each verse is only fetched once when first recorded

