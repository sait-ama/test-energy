import { createClient } from '@re/api/generated/client';

import { ErrorTransformer, patchedFetch } from '~shared/api/$api';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';

export const client = createClient({
  baseUrl: publicEnv('GATEWAY_URL'),
  fetch: patchedFetch,
});

client.interceptors.request.use(async (requestConfig) => {
  let token: string | undefined;
  let preference: string | undefined;

  if (requestConfig.cache === 'force-cache' || requestConfig?.cache === 'no-cache') return;

  if (typeof window !== 'undefined') {
    token = CookieService.get('token');
    preference = CookieService.get('preference');
  } else {
    const { cookies } = require('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
    preference = cookieStore.get('preference')?.value;
  }

  if (token) {
    requestConfig.headers.set('Authorization', `Bearer ${token}`);
  }

  if (preference) {
    requestConfig.headers.set('Preference', preference);
  }
});

client.interceptors.response.use(async (response) => {
  if (response.ok) return response;

  // const parseAs = options.parseAs ?? 'json';

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = (await response.json()) as unknown;
    const error = ErrorTransformer.JSON({ data, status: response.status });
    return Promise.reject(error);
  }

  const error = ErrorTransformer.DEFAULT({
    status: response.status,
    content: await response.text(),
  });

  return Promise.reject(error);
});
