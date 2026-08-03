import { NextRequest, NextResponse } from 'next/server';

export const middleware = (request: NextRequest) => {
  const { pathname, href } = request.nextUrl;

  if (
    pathname.startsWith('/manga') ||
    pathname.startsWith('/novel') ||
    pathname.startsWith('/series')
  ) {
    const rewritePath = href.replace(/manga|novel|series/i, 'content');
    return NextResponse.rewrite(rewritePath);
  }

  return NextResponse.next();
};

export const config = {
  include: /^\/(manga|novel|series)\/*/,
};
