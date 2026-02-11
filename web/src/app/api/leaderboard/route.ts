import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'all-time';

    if (view === 'month') {
      // Current month stats
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Get verse records for the month
      const { data: verseData } = await supabase
        .from('verse_records')
        .select('user_id, points_awarded, users!inner(name, is_leader, emojiIcon)')
        .gte('recorded_at', firstDayOfMonth.toISOString());

      // Get bonus records for the month
      const { data: bonusData } = await supabase
        .from('bonus_records')
        .select('user_id, points_awarded')
        .gte('awarded_at', firstDayOfMonth.toISOString());

      // Aggregate by user
      const userStats = new Map<string, { username: string; verse_count: number; total_points: number; is_leader: boolean; emojiIcon?: string }>();

      // Process verse records
      verseData?.forEach((record: any) => {
        const userId = record.user_id;
        const username = record.users.name;
        const is_leader = record.users.is_leader;
        const emojiIcon = record.users.emojiIcon;
        if (!userStats.has(userId)) {
          userStats.set(userId, { username, verse_count: 0, total_points: 0, is_leader, emojiIcon });
        }
        const stats = userStats.get(userId)!;
        stats.verse_count += 1;
        stats.total_points += record.points_awarded || 0;
      });

      // Add bonus points
      bonusData?.forEach((record: any) => {
        const userId = record.user_id;
        if (!userStats.has(userId)) {
          // User only has bonus points, no verses this month - skip or get username
          return;
        }
        const stats = userStats.get(userId);
        if (stats) {
          stats.total_points += record.points_awarded || 0;
        }
      });

      const leaderboard = Array.from(userStats.entries())
        .map(([user_id, stats]) => ({
          user_id,
          username: stats.username,
          verse_count: stats.verse_count,
          total_points: stats.total_points,
          current_points: 0, // Not relevant for monthly view
          is_leader: stats.is_leader,
          emojiIcon: stats.emojiIcon,
        }))
        .filter(entry => entry.total_points > 0 || entry.verse_count > 0)
        .sort((a, b) => b.total_points - a.total_points || b.verse_count - a.verse_count);

      return NextResponse.json({ items: leaderboard });
    } else {
      // All-time stats from user_points_summary
      const { data } = await supabase
        .from('user_points_summary')
        .select('id, name, is_leader, total_earned, current_points, emojiIcon')
        .gt('total_earned', 0)
        .order('total_earned', { ascending: false });

      // Get verse counts
      const { data: verseCounts } = await supabase
        .from('verse_records')
        .select('user_id');

      const verseCountMap = new Map<string, number>();
      verseCounts?.forEach((record: any) => {
        verseCountMap.set(record.user_id, (verseCountMap.get(record.user_id) || 0) + 1);
      });

      const leaderboard = (data || []).map(user => ({
        user_id: user.id,
        username: user.name,
        verse_count: verseCountMap.get(user.id) || 0,
        total_points: user.total_earned,
        current_points: user.current_points,
        is_leader: user.is_leader,
        emojiIcon: user.emojiIcon,
      }));

      return NextResponse.json({ items: leaderboard });
    }
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
