import { MemoryItem } from './types';

export interface UserPointBreakdown {
  versePoints: number;
  bonusPoints: number;
  totalSpent: number;
  totalEarned: number;
  currentPoints: number;
}

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
  const [legacyResult, verseResult, bonusResult, spendResult] = await Promise.all([
    supabase
      .from('users')
      .select('total_points')
      .eq('id', userId),
    supabase
      .from('verse_records')
      .select('points_awarded')
      .eq('user_id', userId),
    supabase
      .from('bonus_records')
      .select('points_awarded')
      .eq('user_id', userId),
    supabase
      .from('spend_records')
      .select('points_spent')
      .eq('user_id', userId)
      .eq('undone', false),
  ]);

  const legacyPoints = legacyResult.error
    ? 0
    : ((legacyResult.data || [])[0]?.total_points || 0);

  const versePoints = verseResult.error
    ? 0
    : (verseResult.data || []).reduce((sum, record: { points_awarded: number | null }) => sum + (record.points_awarded || 0), 0);
  const bonusPoints = bonusResult.error
    ? 0
    : (bonusResult.data || []).reduce((sum, record: { points_awarded: number | null }) => sum + (record.points_awarded || 0), 0);
  const totalSpent = spendResult.error
    ? 0
    : (spendResult.data || []).reduce((sum, record: { points_spent: number | null }) => sum + (record.points_spent || 0), 0);

  return legacyPoints + versePoints + bonusPoints - totalSpent;
}

export async function getUserPointBreakdowns(
  supabase: ReturnType<typeof import('./supabase-server').getSupabaseAdmin>,
  userIds: string[]
): Promise<Map<string, UserPointBreakdown>> {
  const breakdowns = new Map<string, UserPointBreakdown>();
  const legacyPointsByUser = new Map<string, number>();

  if (userIds.length === 0) {
    return breakdowns;
  }

  const createBreakdown = (userId: string): UserPointBreakdown => {
    const existing = breakdowns.get(userId);
    if (existing) {
      return existing;
    }

    const emptyBreakdown: UserPointBreakdown = {
      versePoints: 0,
      bonusPoints: 0,
      totalSpent: 0,
      totalEarned: 0,
      currentPoints: 0,
    };

    breakdowns.set(userId, emptyBreakdown);
    return emptyBreakdown;
  };

  const [legacyResult, verseResult, bonusResult, spendResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, total_points')
      .in('id', userIds),
    supabase
      .from('verse_records')
      .select('user_id, points_awarded')
      .in('user_id', userIds),
    supabase
      .from('bonus_records')
      .select('user_id, points_awarded')
      .in('user_id', userIds),
    supabase
      .from('spend_records')
      .select('user_id, points_spent')
      .in('user_id', userIds)
      .eq('undone', false),
  ]);

  if (!legacyResult.error) {
    (legacyResult.data || []).forEach((row: { id: string; total_points: number | null }) => {
      createBreakdown(row.id);
      legacyPointsByUser.set(row.id, row.total_points || 0);
    });
  }

  if (!verseResult.error) {
    (verseResult.data || []).forEach((record: { user_id: string; points_awarded: number | null }) => {
      const breakdown = createBreakdown(record.user_id);
      breakdown.versePoints += record.points_awarded || 0;
    });
  }

  if (!bonusResult.error) {
    (bonusResult.data || []).forEach((record: { user_id: string; points_awarded: number | null }) => {
      const breakdown = createBreakdown(record.user_id);
      breakdown.bonusPoints += record.points_awarded || 0;
    });
  }

  if (!spendResult.error) {
    (spendResult.data || []).forEach((record: { user_id: string; points_spent: number | null }) => {
      const breakdown = createBreakdown(record.user_id);
      breakdown.totalSpent += record.points_spent || 0;
    });
  }

  for (const [userId, breakdown] of breakdowns.entries()) {
    const legacyPoints = legacyPointsByUser.get(userId) || 0;
    breakdown.totalEarned = legacyPoints + breakdown.versePoints + breakdown.bonusPoints;
    breakdown.currentPoints = breakdown.totalEarned - breakdown.totalSpent;
  }

  return breakdowns;
}

