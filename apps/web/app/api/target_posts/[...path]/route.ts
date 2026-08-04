import { NextRequest } from 'next/server';
import { proxyToDuck } from '../../duckProxy';

export async function GET(req: NextRequest) {
  return proxyToDuck(req, req.nextUrl.pathname);
}

export async function POST(req: NextRequest) {
  return proxyToDuck(req, req.nextUrl.pathname);
}
