import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getUserPointBreakdowns } from '@/lib/points';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get all users and compute their points from the underlying record tables.
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, is_leader, "emojiIcon"')
      .order('name', { ascending: true });

    if (usersError) {
      console.error('Error fetching users for CSV:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const userIds = (users || []).map((user) => user.id);
    const pointBreakdowns = await getUserPointBreakdowns(supabase, userIds);

    const usersWithDetails = (users || []).map((user) => {
      const breakdown = pointBreakdowns.get(user.id);

      return {
        ...user,
        total_earned: breakdown?.totalEarned ?? 0,
        total_spent: breakdown?.totalSpent ?? 0,
        total_bonus: breakdown?.bonusPoints ?? 0,
      };
    });

    // Generate CSV content
    const headers = ['Name', 'Role', 'Current Points', 'Memory Work Points', 'Bonus/Adjustment Points', 'Total Spent'];
    const csvRows = [
      headers.join(','),
      ...usersWithDetails.map(user => [
        `"${user.name}"`,
        user.is_leader ? 'Leader' : 'Student',
        user.current_points.toString(),
        user.total_earned.toString(),
        user.total_bonus.toString(),
        user.total_spent.toString()
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `word-pointe-points-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating users CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}