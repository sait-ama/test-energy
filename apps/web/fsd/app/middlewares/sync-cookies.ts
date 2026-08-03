import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createCookieUser } from '~entities/user/model/utils';
import { CookieService } from '~shared/utils/cookie-service';
import { parseJson } from '~shared/utils/parse-json';

const syncCookies = (
  serverKey: string,
  clientKey: string,
  ctx: {
    res: NextResponse;
    req: NextRequest;
  },
  prepareValue: (value: string | undefined) => string = (v) => v ?? ''
) => {
  const serverValue = ctx.req.cookies.get(serverKey)?.value;
  const clientValue = ctx.req.cookies.get(clientKey)?.value;

  if (!serverValue && !clientValue) return;

  if (!serverValue || serverValue !== clientValue) {
    CookieService.set(serverKey, prepareValue(clientValue), { httpOnly: true, ...ctx });
  }

  if (!clientValue) {
    CookieService.set(clientKey, prepareValue(serverValue), ctx);
  }
};

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();

  syncCookies('serverToken', 'token', { req, res });
  syncCookies(
    'serverUser',
    'user',
    {
      req,
      res,
    },
    (value) => (value ? JSON.stringify(createCookieUser(parseJson(value ?? '', {})!)) : '')
  );

  return res;
};

export const config = {
  exclude: /^\/(?=.*(_static|api|static|_next|.*\..*)).*/, // only real pages, not static content or etc
};
