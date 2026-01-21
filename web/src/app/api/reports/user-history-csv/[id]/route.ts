import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const supabase = getSupabaseAdmin();
    
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, is_leader')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's verse records
    const { data: records, error: recordsError } = await supabase
      .from('verse_records')
      .select(`
        id,
        record_type,
        points_awarded,
        created_at,
        memory_items!inner (
          name,
          reference,
          text
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (recordsError) {
      console.error('Error fetching records:', recordsError);
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    // Get user's spend records
    const { data: spends, error: spendsError } = await supabase
      .from('spend_records')
      .select(`
        id,
        points_spent,
        note,
        spent_at,
        undone
      `)
      .eq('user_id', userId)
      .order('spent_at', { ascending: false });

    if (spendsError) {
      console.error('Error fetching spends:', spendsError);
      return NextResponse.json({ error: 'Failed to fetch spends' }, { status: 500 });
    }

    // Get user's bonus records
    const { data: bonuses, error: bonusesError } = await supabase
      .from('bonus_records')
      .select(`
        id,
        points_awarded,
        reason,
        category,
        awarded_at
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    if (bonusesError) {
      console.error('Error fetching bonus records:', bonusesError);
      // Don't fail if bonus records can't be fetched - table might not exist yet
    }

    // Combine and sort all transactions by date
    const allTransactions = [
      ...records.map(record => ({
        date: new Date(record.created_at).toLocaleDateString(),
        time: new Date(record.created_at).toLocaleTimeString(),
        timestamp: new Date(record.created_at).getTime(),
        type: 'Memory Work',
        item: (record.memory_items as any)?.reference || 'Unknown Item',
        reference: (record.memory_items as any)?.reference || '',
        recordType: record.record_type,
        pointsChange: `+${record.points_awarded}`,
        description: `${record.record_type === 'first' ? 'First time' : 'Repeat'} - ${(record.memory_items as any)?.reference || 'Unknown'}`
      })),
      ...spends.map(spend => ({
        date: new Date(spend.spent_at).toLocaleDateString(),
        time: new Date(spend.spent_at).toLocaleTimeString(),
        timestamp: new Date(spend.spent_at).getTime(),
        type: spend.undone ? 'Spend (Undone)' : 'Spend',
        item: 'Points Spent',
        reference: '',
        recordType: '',
        pointsChange: spend.undone ? `${spend.points_spent}` : `-${spend.points_spent}`,
        description: spend.note || 'Points spent'
      })),
      ...(bonuses || []).map(bonus => ({
        date: new Date(bonus.awarded_at).toLocaleDateString(),
        time: new Date(bonus.awarded_at).toLocaleTimeString(),
        timestamp: new Date(bonus.awarded_at).getTime(),
        type: `Bonus (${bonus.category})`,
        item: bonus.category === 'legacy' ? 'Legacy Points' : bonus.category === 'correction' ? 'Correction' : 'Bonus',
        reference: '',
        recordType: '',
        pointsChange: bonus.points_awarded > 0 ? `+${bonus.points_awarded}` : `${bonus.points_awarded}`,
        description: bonus.reason
      }))
    ].sort((a, b) => b.timestamp - a.timestamp);

    // Generate CSV content
    const headers = ['Date', 'Time', 'Type', 'Item', 'Reference', 'Record Type', 'Points Change', 'Description'];
    const csvRows = [
      headers.join(','),
      ...allTransactions.map(transaction => [
        `"${transaction.date}"`,
        `"${transaction.time}"`,
        `"${transaction.type}"`,
        `"${transaction.item}"`,
        `"${transaction.reference}"`,
        `"${transaction.recordType}"`,
        `"${transaction.pointsChange}"`,
        `"${transaction.description}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `word-pointe-${user.name.replace(/[^a-zA-Z0-9]/g, '-')}-history-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating user history CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}