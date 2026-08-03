// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from '@sentry/nextjs';

init({
  enabled: process.env.SENTRY_ENABLED === '1',

  dsn: process.env.SENTRY_URL,
  sendDefaultPii: true,
  release: process.env.GIT_HASH,
  ignoreErrors: [
    'controller[kState].transformAlgorithm is not a function', // idk what is it but is doesn't affect anyhow
    'NEXT_HTTP_ERROR_FALLBACK;403',
    'NEXT_HTTP_ERROR_FALLBACK;401',
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  tracesSampleRate: 1,
  profilesSampleRate: 0,
  beforeSend(event) {
    // if (event.transaction) {
    //   if (event.transaction.includes('reservices.io')) return false
    // }

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
