import { cache, type FC } from 'react';
import Script from 'next/script';

import { PublicEnvSchema } from '../../../config/next/env';

const PUBLIC_ENV_KEY = '__ENV';

export function isBrowser() {
  return Boolean(typeof window !== 'undefined' && window[PUBLIC_ENV_KEY]);
}

export const createPublicEnv = (raw: NodeJS.ProcessEnv): PublicEnvSchema => {
  return {
    BUG_REPORT_URL: raw.BUG_REPORT_URL,
    NODE_ENV: raw.NODE_ENV,
    DOMAIN: raw.DOMAIN,
    GATEWAY_URL: raw.GATEWAY_URL,
    CHAT_WS_URL: raw.CHAT_WS_URL,
    MEDIA_URL: raw.MEDIA_URL,
    GIT_HASH: raw.GIT_HASH,
    DUNS_REGISTERED: raw.DUNS_REGISTERED,
    CONNECTING_IP_HEADER: raw.CONNECTING_IP_HEADER,
    RECAPTCHA_DISABLED: raw.RECAPTCHA_DISABLED,
    RECAPTCHA_KEY: raw.RECAPTCHA_KEY,
    SMARTCAPTCHA_KEY: raw.SMARTCAPTCHA_KEY,
    SENTRY_URL: raw.SENTRY_URL,
    SENTRY_ORG: raw.SENTRY_ORG,
    SENTRY_PROJECT: raw.SENTRY_PROJECT,
    SENTRY_DSN: raw.SENTRY_DSN,
    GGL_APP_ID: raw.GGL_APP_ID,
    FB_APP_ID: raw.FB_APP_ID,
    VK_APP_ID: raw.VK_APP_ID,
    YANDEX_APP_ID: raw.YANDEX_APP_ID,
    MAIL_APP_ID: raw.MAIL_APP_ID,
    DISCORD_APP_ID: raw.DISCORD_APP_ID,
    TELEGRAM_BOT_ID: raw.TELEGRAM_BOT_ID,

    SOCIAL_REDIRECT: raw.SOCIAL_REDIRECT,

    VK_PIXEL: raw.VK_PIXEL,
    GOOGLE_TAG_MANAGER_ID: raw.GOOGLE_TAG_MANAGER_ID,
    GOOGLE_ANALYTICS_ID: raw.GOOGLE_ANALYTICS_ID,
    METRIKA_APP_ID: raw.METRIKA_APP_ID,

    RELEASE_ID: raw.GIT_HASH || raw.RELEASE_ID,

    DEFAULT_IMAGE_SERVER: raw.DEFAULT_IMAGE_SERVER,

    PANEL_URL: raw.PANEL_URL,
    ADMIN_URL: raw.ADMIN_URL,
  };
};

export const publicEnv = cache((key: keyof PublicEnvSchema) => {
  if (isBrowser()) return window[PUBLIC_ENV_KEY][key];

  // noStore();

  return process.env[key];
});

interface NonceConfig {
  headerKey: string;
}

interface EnvScriptProps {
  nonce?: string | NonceConfig;
}

export const EnvScript: FC<EnvScriptProps> = async ({ nonce }) => {
  // await connection();
  // noStore()
  let nonceString: string | undefined;

  // XXX: Blocked by https://github.com/vercel/next.js/pull/58129
  // if (typeof nonce === 'object' && nonce !== null) {
  //   // It's strongly recommended to set a nonce on your script tags.
  //   nonceString = headers().get(nonce.headerKey) ?? undefined;
  // }

  if (typeof nonce === 'string') {
    nonceString = nonce;
  }

  return (
    <Script
      id="public-env"
      strategy="beforeInteractive"
      type="text/javascript"
      nonce={nonceString}
      dangerouslySetInnerHTML={{
        __html: `window['${PUBLIC_ENV_KEY}'] = ${JSON.stringify(createPublicEnv(process.env))};`,
      }}
    />
  );
};
