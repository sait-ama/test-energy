import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REFERRAL_FIELD_NAME } from '~entities/analytics/model/const';

export const middleware = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const isAuthorized = !!request.cookies.get('user')?.value;

  if (!searchParams.has(REFERRAL_FIELD_NAME) || isAuthorized) return NextResponse.next();

  const response = NextResponse.next();

  response.cookies.set(REFERRAL_FIELD_NAME, JSON.stringify(searchParams.get(REFERRAL_FIELD_NAME)));

  return response;
};

export const config = {
  exclude: /^\/(?=.*(_static|api|static|_next|.*\..*)).*/, // only real pages, not static content or etc
};
