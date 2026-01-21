import { getSupabaseAdmin } from './supabase-server';

/**
 * Check if a user has already recorded a specific memory item
 */
export async function hasUserRecordedItem(userId: string, memoryItemId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('verse_records')
    .select('id')
    .eq('user_id', userId)
    .eq('memory_item_id', memoryItemId)
    .limit(1);

  if (error) {
    console.error('Error checking existing records:', error);
    return false; // Default to false if we can't check
  }

  return (data && data.length > 0);
}

/**
 * Get the count of times a user has recorded a specific memory item
 */
export async function getUserRecordCount(userId: string, memoryItemId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  
  const { data, error, count } = await supabase
    .from('verse_records')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('memory_item_id', memoryItemId);

  if (error) {
    console.error('Error getting record count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Determine if the next record should be "first" or "repeat"
 * Returns "first" if user has never recorded this item, "repeat" if they have
 */
export async function determineRecordType(userId: string, memoryItemId: string): Promise<'first' | 'repeat'> {
  const hasRecorded = await hasUserRecordedItem(userId, memoryItemId);
  return hasRecorded ? 'repeat' : 'first';
}

/**
 * Get detailed record information for a user and memory item combination
 */
export async function getRecordInfo(userId: string, memoryItemId: string) {
  const count = await getUserRecordCount(userId, memoryItemId);
  const recordType = await determineRecordType(userId, memoryItemId);
  
  return {
    count,
    recordType,
    hasRecorded: count > 0,
    isFirst: recordType === 'first'
  };
}