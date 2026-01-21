import { MemoryItem } from './types';

/**
 * Compute points for a memory record.
 * Server-side logic allows for future features like "double points month".
 */
export function computePoints(
  memoryItem: MemoryItem,
  recordType: 'first' | 'repeat',
  options?: {
    multiplier?: number;
    promo?: string;
  }
): {
  points_awarded: number;
  applied_multiplier: number;
  applied_promo: string | null;
} {
  const basePoints = recordType === 'first' 
    ? memoryItem.points_first 
    : memoryItem.points_repeat;

  // Apply multiplier (for future "double points month" features)
  const multiplier = options?.multiplier ?? 1.0;
  const points_awarded = Math.round(basePoints * multiplier);

  return {
    points_awarded,
    applied_multiplier: multiplier,
    applied_promo: options?.promo ?? null,
  };
}

/**
 * Check if user can spend points (not overspending)
 */
export async function getCurrentPoints(
  supabase: ReturnType<typeof import('./supabase-server').getSupabaseAdmin>,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('user_points_summary')
    .select('current_points')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.current_points ?? 0;
}

