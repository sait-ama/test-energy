// GET METHOD IS INSECURE
// export async function GET(request: Request) {}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { captureException } from '@sentry/nextjs';

import type { CookieOptions } from '~shared/utils/cookie-service';
import { CookieService } from '~shared/utils/cookie-service';

type PostBody = {
  key: string;
  value: string;
  options?: Omit<CookieOptions, 'httpOnly' | 'expires'> & {
    expires?: number; // timestamp
  };
}[];

const allowedKeys = ['serverToken', 'serverUser'];

export async function POST(req: NextRequest) {
  try {
    const res = new NextResponse(null, {
      status: 204,
    });

    const body = (await req.json()) as PostBody;

    body.map(({ key, value }) => {
      if (!allowedKeys.includes(key)) return;

      CookieService.set(key, value, { httpOnly: true, req, res });
    });

    return res;
  } catch (e: unknown) {
    console.error(e);
    captureException(e);
    return new Response('Bad request', {
      status: 400,
    });
  }
}

type DeleteBody = string[];

export async function DELETE(req: NextRequest) {
  try {
    const res = new NextResponse(null, {
      status: 204,
    });

    const body = (await req.json()) as DeleteBody;

    body.map((key) => {
      if (!allowedKeys.includes(key)) return;

      CookieService.delete(key, { req, res });
    });

    return res;
  } catch (e: unknown) {
    console.error(e);

    captureException(e);
    return new Response('Bad request', {
      status: 400,
    });
  }
}
