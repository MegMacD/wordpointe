import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get all users with their current points
    const { data: users, error: usersError } = await supabase
      .from('user_points_summary')
      .select('*')
      .order('current_points', { ascending: false });

    if (usersError) {
      console.error('Error fetching users for CSV:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get total earned and spent for each user
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      const { data: records } = await supabase
        .from('verse_records')
        .select('points_awarded')
        .eq('user_id', user.id);
      
      const { data: spends } = await supabase
        .from('spend_records')
        .select('points_spent')
        .eq('user_id', user.id)
        .eq('undone', false);
      
      const { data: bonuses } = await supabase
        .from('bonus_records')
        .select('points_awarded')
        .eq('user_id', user.id);
      
      const totalEarned = records?.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || 0;
      const totalSpent = spends?.reduce((sum, s) => sum + (s.points_spent || 0), 0) || 0;
      const totalBonus = bonuses?.reduce((sum, b) => sum + (b.points_awarded || 0), 0) || 0;
      
      return {
        ...user,
        total_earned: totalEarned,
        total_spent: totalSpent,
        total_bonus: totalBonus
      };
    }));

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