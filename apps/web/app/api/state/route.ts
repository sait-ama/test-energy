import { NextRequest } from 'next/server';
import { proxyToDuck } from '../duckProxy';

export async function GET(req: NextRequest) {
  return proxyToDuck(req, '/api/state');
}
