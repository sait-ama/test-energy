import { NextRequest, NextResponse } from 'next/server';

import { Routing } from '~shared/config/routing';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.includes('protected_route__')) {
    return NextResponse.redirect(
      UrlFormatter.createUrl(
        request.nextUrl.pathname,
        Routing.Home.main({ message: 'Какой умный, откуда ты знаешь об этом урле?' })
      )
    );
  }

  return NextResponse.next();
};

export const config = {
  exclude: /^\/(?=.*(_static|api|static|_next|.*\..*)).*/, // only real pages, not static content or etc
};
