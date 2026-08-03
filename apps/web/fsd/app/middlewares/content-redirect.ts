import { NextRequest, NextResponse } from 'next/server';

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  if (
    segments.length === 2 &&
    (segments[0] === 'manga' || segments[0] === 'novel' || segments[0] === 'series')
  ) {
    const [type, dir] = segments;

    if (dir === 'edit' || dir === 'top' || dir === 'hot-updates' || dir === 'add') {
      return NextResponse.next();
    }

    const newUrl = new URL(`/${type}/${dir}/main/`, request.url);
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
};

export const config = {
  include: /^\/(manga|novel|series)\/([^\/]+)\/?$/,
};
