# Verse Data Quality - Testing & Verification Guide

This guide walks you through verifying that verse data is clean and consistent.

## 1. Run Data Quality Check

Execute the data quality check script in your Supabase SQL Editor:

```bash
# Open supabase/data_quality_check.sql in Supabase and run it
```

This will show you:
- Any duplicate references (case-insensitive)
- References with unusual formatting
- Verse items missing Bible version
- Inactive items
- Summary statistics
- Bible version distribution

## 2. Review the Results

Look for:
- **Duplicates**: Should be 0 (handled by unique constraint and normalization)
- **Unusual Formatting**: Should be 0 (references should start with capital letter)
- **Missing Bible Version**: Should be 0 (all verses should have a version)
- **Inactive Items**: Review if these should be deleted or kept

## 3. Run Cleanup (If Needed)

If the quality check found issues:

1. **Backup first**:
   ```sql
   CREATE TABLE memory_items_backup AS SELECT * FROM memory_items;
   ```

2. Run the cleanup script:
   ```bash
   # Open supabase/cleanup_memory_items.sql in Supabase
   # Review the NOTICE messages carefully
   # Uncomment the DELETE/UPDATE lines if you want to apply changes
   # Run the script
   ```

3. Re-run the quality check to verify cleanup worked

## 4. Test Normalization in the UI

Test reference normalization in the admin panel:

### Test Case 1: Lowercase reference
1. Go to Admin → Memory Items
2. Try to add "john 3:16" (lowercase)
3. ✅ Should normalize to "John 3:16"

### Test Case 2: Abbreviated book name  
1. Try to add "jn 3:16"
2. ✅ Should normalize to "John 3:16"

### Test Case 3: Duplicate detection
1. Try to add "John 3:16" again
2. ✅ Should show error: "A memory item with this reference already exists"

### Test Case 4: Reactivation
1. Deactivate "John 3:16" in the admin panel
2. Try to add "John 3:16" again
3. ✅ Should reactivate the existing item instead of creating a duplicate

### Test Case 5: Invalid reference
1. Try to add "Invalid 99:99"
2. ✅ Should show error about book name

## 5. Test Auto-Creation from Record Page

Test that verses created on-the-fly also get normalized:

1. Go to Record page
2. Enter a verse reference in Quick Add: "matt 5:16" (abbreviated, lowercase)
3. Select a user
4. Submit
5. Go to Admin → Memory Items
6. ✅ Verify "Matthew 5:16" was created (normalized)

## 6. Run the Normalization Migration

Apply the new migration to add comments and checks:

```bash
# In Supabase SQL Editor, run:
# supabase/migrations/010_normalize_references.sql
```

This migration:
- Checks for potential duplicates
- Reports references that need normalization
- Adds helpful comments to the database schema

## 7. Verify with Automated Tests

```bash
cd web
npm test -- bible-api
```

This runs unit tests for the Bible API validation and normalization functions.

## 8. Expected State After Verification

After completing these steps:

✅ All verse references are normalized (e.g., "John 3:16" not "john 3:16")  
✅ No duplicate references in the database  
✅ All verse-type items have a bible_version  
✅ Unique constraint prevents duplicates at DB level  
✅ Application code normalizes all references before storing  
✅ Duplicate references are reactivated instead of creating new items

## 9. Ongoing Maintenance

**Weekly**: Run data_quality_check.sql to monitor data health

**After major imports**: Run cleanup script if bulk data was added

**Before production deploys**: Verify no quality issues exist

## Troubleshooting

### Issue: Found duplicates in quality check
**Solution**: Run cleanup_memory_items.sql (after backup!)

### Issue: References not normalizing
**Solution**: Check that validateBibleReference is imported in API routes

### Issue: Unique constraint violation
**Solution**: This is expected - it means duplicate prevention is working. The application should catch this and reactivate instead.

## Files Reference

- `supabase/data_quality_check.sql` - Run this to audit data
- `supabase/cleanup_memory_items.sql` - Run this to fix issues
- `supabase/migrations/010_normalize_references.sql` - Migration to add checks
- `web/src/lib/bible-api.ts` - Contains validateBibleReference() function
- `web/src/app/api/memory-items/route.ts` - POST endpoint normalizes references
- `web/src/app/api/memory-items/[id]/route.ts` - PATCH endpoint normalizes references
- `web/src/app/api/records/route.ts` - Auto-create normalizes references
