import { NextRequest, NextResponse } from 'next/server';

import { getSiteConfig } from '~shared/config/site-config';
import { verifyHash } from '~shared/lib/halloween-event/hash';

// just sign
type PostBody = string;

export async function POST(req: NextRequest) {
  const fakeRes = new NextResponse(null, {
    status: 204,
  });

  const forbidden = new NextResponse('Forbidden', {
    status: 403,
  });

  const cookiesStore = req.cookies;

  try {
    const hash = (await req.text()) as PostBody;

    if (typeof hash !== 'string') throw 'Expected string';

    const token = cookiesStore.get('token')?.value;
    const siteConfig = getSiteConfig()!;

    const userResponse = await fetch(`${siteConfig.routing.url}/api/v2/users/current/`, {
      headers: {
        referer: siteConfig.routing.url,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        Authorization: `Bearer ${token}`,
      },
    }).then((v) => v.json());

    if (!userResponse) return forbidden;

    const currentUser = userResponse;
    const eventPoints = currentUser.event_points ?? 0;

    try {
      const isValid = await verifyHash(eventPoints, hash);

      if (!isValid) return fakeRes;
    } catch (e) {
      // if something went wrong, let users get theirs points
    }

    await fetch(`${siteConfig.routing.url}/api/v2/users/event/`, {
      method: 'POST',
      headers: {
        referer: siteConfig.routing.url,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        Authorization: `Bearer ${token}`,
      },
    });

    const res = new NextResponse(null, {
      status: 204,
    });

    return res;
  } catch (e: unknown) {
    console.error(e);
    return new Response('Bad request', {
      status: 400,
    });
  }
}
