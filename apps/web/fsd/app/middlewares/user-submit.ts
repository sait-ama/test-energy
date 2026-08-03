import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { AuthCookiesService } from '~entities/user/model/lib';
import { UserRepository } from '~entities/user/model/repository';
import { Routing } from '~shared/config/routing';
import { getError } from '~shared/lib/form/error-handling-base';
import { logger } from '~shared/lib/logger';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const middleware = async (req: NextRequest) => {
  const url = req.nextUrl;

  const { searchParams } = url;

  if (searchParams.get('error')) return NextResponse.next();

  const uid = searchParams.get('uid')!;
  const token = searchParams.get('token')!;
  const email = searchParams.get('email')!;

  try {
    const data = await UserRepository.activate({
      uid,
      token,
      email,
    });

    const { access_token, ...user } = data.content;

    const redirectUri = UrlFormatter.createUrl(
      req.nextUrl.origin,
      Routing.Home.main({ query: {} })
    );

    const res = NextResponse.redirect(redirectUri);

    AuthCookiesService.setClient({ user, token: access_token }, { res, req });

    return res;
  } catch (e: unknown) {
    logger.error(e);

    const redirectUri = UrlFormatter.createUrl(
      req.nextUrl.origin,
      Routing.Home.main({
        query: {
          __notification: {
            type: 'toast',
            message: getError(e).message,
            severity: 'error',
          },
        },
      })
    );

    return NextResponse.redirect(redirectUri);
  }
};

export const config = {
  include: /^\/user\/submit\/?$/,
};
