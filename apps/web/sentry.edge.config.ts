// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from '@sentry/nextjs';

init({
  enabled: process.env.SENTRY_ENABLED === '1',

  dsn: process.env.SENTRY_URL,
  sendDefaultPii: true,
  release: process.env.GIT_HASH,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  tracesSampleRate: 1,
  profilesSampleRate: 0,
  ignoreErrors: [
    'controller[kState].transformAlgorithm is not a function', // idk what is it but is doesn't affect anyhow
    'NEXT_HTTP_ERROR_FALLBACK;403',
    'NEXT_HTTP_ERROR_FALLBACK;401',
  ],
  beforeSend(event) {
    for (const exception of event.exception?.values ?? []) {
      if (exception.type === 'API Error') {
        event.level = 'warning';
        break;
      }
    }

    event.breadcrumbs = (event.breadcrumbs ?? []).filter((it) => {
      if (it.category === 'fetch') {
        return (
          !it.data?.url.includes('yandex.ru') &&
          !it.data?.url.includes('mail.ru') &&
          !it.data?.url.includes('analytics.google.com') &&
          !it.data?.url.includes('reservices.io')
        );
      }

      return true;
    });

    return event;
  },
  // tunnel: '/bff-api/monitoring',
});
