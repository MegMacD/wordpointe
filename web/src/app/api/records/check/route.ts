import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRecordInfo } from '@/lib/record-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const memoryItemId = searchParams.get('memory_item_id');

    if (!userId || !memoryItemId) {
      return NextResponse.json(
        { error: 'user_id and memory_item_id are required' },
        { status: 400 }
      );
    }

    const recordInfo = await getRecordInfo(userId, memoryItemId);

    return NextResponse.json({
      user_id: userId,
      memory_item_id: memoryItemId,
      record_type: recordInfo.recordType,
      count: recordInfo.count,
      has_recorded: recordInfo.hasRecorded,
      is_first: recordInfo.isFirst
    });

  } catch (error: any) {
    console.error('Error checking record status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check record status' },
      { status: 500 }
    );
  }
}