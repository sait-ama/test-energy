import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import { ContentTypes } from '~shared/config/constants';
import { UrlBuilder } from '~shared/utils/url-formatter';

// should be before content rewrite, or refactor to all content types
export const middleware = async (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl;
  const nextUrl = new URL(request.nextUrl.href);

  try {
    // /content/[word]/[[...other]]
    if (Object.values(ContentTypes).some((contentType) => pathname.startsWith(`/${contentType}`))) {
      const segments = pathname.split('/');
      const word = segments[2];

      const catalogPath = '/content/protected_route__catalog';

      if (!word) {
        nextUrl.pathname = catalogPath;
        return NextResponse.rewrite(nextUrl.toString());
      }

      if (PATH_NORMALIZATION_SCHEMA.some((value) => value.key === word)) {
        nextUrl.pathname = new UrlBuilder(catalogPath)
          .add(word)
          .add(segments.slice(3).join('/'))
          .build();
        nextUrl.search = searchParams.toString();

        return NextResponse.rewrite(nextUrl.toString());
      }
    }
  } catch {
    // DO NOTHING!@!
  }

  return NextResponse.next();
};

export const config = {
  exclude: /^\/(?=.*(_static|api|static|_next|.*\..*)).*/,
};
