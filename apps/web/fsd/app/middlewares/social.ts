import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { REFERRAL_FIELD_NAME, UTM_FIELD_NAME } from '~entities/analytics/model/const';
import { AuthCookiesService } from '~entities/user/model/lib';
import { SocialActionType, SocialService } from '~features/auth/model/service';
import { SaveUserUrchinTrackingModuleRequestSchema } from '~shared/api/models/analytics';
import { SocialProviders } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { transformErrorDetail } from '~shared/lib/form/error-handling-base';
import { logger } from '~shared/lib/logger';
import { isApiError } from '~shared/types/api.type-guard';
import { isJson } from '~shared/utils/is-json';
import { parseJson } from '~shared/utils/parse-json';
import { UrlFormatter } from '~shared/utils/url-formatter';

const handleLogin = async (options: {
  request: NextRequest;
  provider: SocialProviders;
  redirectUri: string | undefined;
  state: string;
}) => {
  const { request, provider, redirectUri, state } = options;

  const { searchParams } = request.nextUrl;

  // @ts-ignore
  const handler = SocialService.LoginInner[provider];

  if (!handler) {
    const url = UrlFormatter.createUrl(request.nextUrl.origin, Routing.Home.main({ query: {} }));

    return NextResponse.redirect(url);
  }

  const referral = request.cookies.get(REFERRAL_FIELD_NAME)?.value;
  const utmCookie = request.cookies.get(UTM_FIELD_NAME)?.value;

  let utm: SaveUserUrchinTrackingModuleRequestSchema | {} = {};

  if (isJson(utmCookie)) {
    const utmJson = parseJson<SaveUserUrchinTrackingModuleRequestSchema>(utmCookie!)!;
    utm = {
      campaign: utmJson.utm_campaign,
      medium: utmJson.utm_medium,
      source: utmJson.utm_source,
      content: utmJson.utm_content,
      term: utmJson.utm_term,
    };
  }

  const meta = {
    referral,
    ...utm,
  };

  const code = searchParams.get('code');
  const payload = {
    state,
    code: isJson(code) ? parseJson(code) : code,
    payload: searchParams.get('payload'),
  };

  try {
    const { token, auth_type, user } = await handler({ payload, meta });
    const resolverRedirectUrl = new URL(
      UrlFormatter.createUrl(request.nextUrl.origin, redirectUri)
    );

    let fieldName: '__loggedBy' | '__registeredBy' | null = null;

    if (auth_type === 'login') {
      fieldName = '__loggedBy';
    } else if (auth_type === 'registration') {
      fieldName = '__registeredBy';
    }

    if (fieldName) {
      resolverRedirectUrl.searchParams.set(fieldName, provider);
    }

    const nextResponse = NextResponse.redirect(resolverRedirectUrl.toString());

    AuthCookiesService.setClient({ user, token }, { res: nextResponse, req: request });

    return nextResponse;
  } catch (e) {
    logger.error(e);

    const message = isApiError(e)
      ? transformErrorDetail(e.data)
      : `Произошла непредвиденная ошибка. ${provider}`;

    const nextUrl = UrlFormatter.createUrl(
      request.nextUrl.origin,
      Routing.Home.main({
        query: {
          __notification: {
            type: 'toast',
            severity: 'error',
            message,
          },
        },
      })
    );

    return NextResponse.redirect(nextUrl);
  }
};

const handleLink = async (options: {
  request: NextRequest;
  provider: SocialProviders;
  redirectUri: string | undefined;
  state: string;
}) => {
  const { request, provider, redirectUri, state } = options;

  if (provider === SocialProviders.VK_CONNECT) return NextResponse.next();

  const { searchParams } = request.nextUrl;

  // @ts-ignore
  const handler = SocialService.LinkInner[provider];

  if (!handler) {
    const url = UrlFormatter.createUrl(request.nextUrl.origin, Routing.Home.main({ query: {} }));
    return NextResponse.redirect(url);
  }

  const code = searchParams.get('code');

  const payload = {
    state,
    code: isJson(code) ? parseJson(code) : code,
    payload: searchParams.get('payload'),
  };

  try {
    const nextUrl = UrlFormatter.createUrl(request.nextUrl.origin, redirectUri);
    const nextResponse = NextResponse.redirect(nextUrl);

    await handler({ payload });

    return nextResponse;
  } catch (e: unknown) {
    logger.error(e);

    const message = isApiError(e)
      ? transformErrorDetail(e.data)
      : `Произошла непредвиденная ошибка. ${provider}`;

    const nextUrl = UrlFormatter.createUrl(
      request.nextUrl.origin,
      Routing.Home.main({
        query: {
          __notification: {
            type: 'toast',
            message,
            severity: 'error',
          },
        },
      })
    );

    return NextResponse.redirect(nextUrl);
  }
};

export const middleware = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const state = searchParams.get('state')!;

  if (!state) return NextResponse.next();
  const decodedState = atob(state);

  const [provider, redirectUri, type] = decodedState ? decodedState.split(',') : [];

  if (type === SocialActionType.AUTH)
    return await handleLogin({
      state: decodedState,
      request,
      provider: provider as SocialProviders,
      redirectUri,
    });
  if (type === SocialActionType.LINK)
    return await handleLink({
      state: decodedState,
      request,
      provider: provider as SocialProviders,
      redirectUri,
    });

  return NextResponse.next();
};

export const config = {
  include: /^\/social(\?.*)?$/,
};
