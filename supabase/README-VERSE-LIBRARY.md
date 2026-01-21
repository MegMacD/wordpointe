# Verse Library Setup

This directory contains SQL scripts to populate your database with memory verses and other items.

## Files

- `000_main_schema.sql` - Core database schema (run first)
- `001_auth_schema.sql` - Authentication tables and users
- `seed.sql` - Basic sample data for testing
- `verse_library.sql` - **Optional: Sample verse library for initial setup**

## Auto-Creation (Recommended)

The app now automatically fetches and creates Bible verses on-demand when they are first recorded. You don't need to pre-load verses - just record a verse reference (e.g., "John 3:16") and the app will:
1. Fetch the verse text from the Bible API (ESV)
2. Create a memory item with appropriate points
3. Save it to the database for future use

## Loading the Verse Library (Optional)

If you want to pre-populate some common verses, you can load the verse library:

### Option 1: Supabase Dashboard
1. Log into your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `verse_library.sql`
4. Click "Run"

### Option 2: Supabase CLI (if installed)
```bash
supabase db reset
# This will run all migrations and seed data
```

### Option 3: Manual SQL
Connect to your PostgreSQL database and run:
```sql
\i verse_library.sql
```

## What's Included

The verse library includes:

### **Core Gospel Verses** (4 verses)
- John 3:16, Romans 6:23, Romans 10:9, Ephesians 2:8-9

### **Faith and Trust** (4 verses)  
- Proverbs 3:5-6, Philippians 4:13, Hebrews 11:1, Jeremiah 29:11

### **Love and Relationships** (4 verses)
- 1 John 4:8, John 13:34-35, 1 Corinthians 13:13, Ephesians 4:32

### **Guidance and Wisdom** (3 verses)
- Psalm 119:105, James 1:5, Proverbs 22:6

### **Strength and Comfort** (4 verses)
- Psalm 23:1, Isaiah 41:10, Philippians 4:19, 2 Timothy 1:7

### **Prayer** (3 verses)
- Philippians 4:6-7, 1 Thessalonians 5:17, Matthew 6:9-11

### **Obedience and Service** (3 verses)
- Ephesians 6:1, Colossians 3:20, Matthew 28:19-20

### **Simple Verses for Young Children** (4 verses)
- Short, easy verses perfect for preschool and early elementary

### **Custom Memory Work** (6 items)
- Books of the New Testament
- Books of the Old Testament (first 10)
- Fruits of the Spirit
- Ten Commandments
- Names of Jesus
- Armor of God

## Point Values

Verses are assigned points based on length and difficulty:
- **Short verses** (3-8 points first time, 2-4 repeat)
- **Medium verses** (10-12 points first time, 5-6 repeat)  
- **Long verses** (15-20 points first time, 8-12 repeat)
- **Custom items** (15-30 points first time, 8-20 repeat)

## Customization

Feel free to:
- Adjust point values in the SQL
- Add your own verses
- Change which verses are active/inactive
- Modify verse text translations (KJV included by default)

## Bible Translation

The verse_library.sql uses the King James Version (KJV). However, the auto-creation feature uses ESV (English Standard Version) by default. If you manually load verses from verse_library.sql, you may want to update them to ESV for consistency, or just let the auto-creation handle new verses.