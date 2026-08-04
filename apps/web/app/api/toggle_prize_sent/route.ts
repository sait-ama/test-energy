import { NextRequest } from 'next/server';
import { proxyToDuck } from '../duckProxy';

export async function POST(req: NextRequest) {
  return proxyToDuck(req, '/api/toggle_prize_sent');
}
