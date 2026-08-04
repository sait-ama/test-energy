import { NextRequest } from 'next/server';
import { proxyToDuck } from '../duckProxy';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return proxyToDuck(req, '/api/toggle_avatar');
}
