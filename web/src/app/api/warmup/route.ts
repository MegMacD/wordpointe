import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.WARMUP_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const providedSecret =
    request.headers.get('x-warmup-secret') ||
    request.nextUrl.searchParams.get('key');

  return providedSecret === secret;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startedAt = Date.now();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      warmed: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Warmup failed';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
