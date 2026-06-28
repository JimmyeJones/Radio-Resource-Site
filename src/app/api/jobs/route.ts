import { NextResponse } from 'next/server';
import { recentActive } from '@/server/jobs/queue';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(recentActive(12));
}
