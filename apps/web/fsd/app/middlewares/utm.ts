import { after, NextRequest, NextResponse } from 'next/server';

import { UTM_FIELD_NAME } from '~entities/analytics/model/const';
import { AnalyticsRepository } from '~entities/analytics/model/repository';
import type { SaveUserUrchinTrackingModuleRequestSchema } from '~shared/api/models/analytics';
import { logger } from '~shared/lib/logger';
import { defaultOptions } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';
import { isJson } from '~shared/utils/is-json';
import { parseJson } from '~shared/utils/parse-json';

export const middleware = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const utm_source = searchParams.get('utm_source');
  const utm_medium = searchParams.get('utm_medium');
  const utm_campaign = searchParams.get('utm_campaign');
  const utm_content = searchParams.get('utm_content');
  const utm_term = searchParams.get('utm_term');

  if (!utm_source) return NextResponse.next();

  const cookieUTM = request.cookies.get(UTM_FIELD_NAME)?.value;
  const isAuthorized = !!request.cookies.get('token')?.value;

  if (isAuthorized) {
    const data = (
      isJson(cookieUTM!)
        ? parseJson<SaveUserUrchinTrackingModuleRequestSchema>(cookieUTM!)
        : {
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
          }
    ) as SaveUserUrchinTrackingModuleRequestSchema;

    after(async () => {
      try {
        await AnalyticsRepository.saveUserUrchinTrackingModule({ data });
      } catch (e) {
        logger.error(e);
      }
    });

    return NextResponse.next();
  }

  const response = NextResponse.next();

  const resolvedOptions = { ...defaultOptions };

  if (publicEnv('NODE_ENV') === 'production') {
    resolvedOptions.domain = `.${publicEnv('DOMAIN')}`;
  }

  response.cookies.set({
    name: UTM_FIELD_NAME,
    value: JSON.stringify({
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    }),
    ...resolvedOptions,
  });

  return response;
};

export const config = {
  exclude: /^\/(?=.*(_static|api|static|_next|.*\..*)).*/, // only real pages, not static content or etc
};
