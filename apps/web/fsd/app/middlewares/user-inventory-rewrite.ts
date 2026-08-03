import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { customizationTabs } from '~pages/(user)/inventory-tab/model/const';

const VALID_TYPES = new Set<string>(customizationTabs.map((v) => v.tab));

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const typeParam = url.searchParams.get('type')?.toLowerCase();
  if (typeParam && VALID_TYPES.has(typeParam)) {
    url.searchParams.delete('type');
    url.searchParams.set('type', 'customization');
    url.searchParams.set('shopType', typeParam);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { include: /^\/user\/[^/]+\/inventory$/ };
