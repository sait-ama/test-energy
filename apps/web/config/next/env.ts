import { v4 } from 'uuid';
import { z } from 'zod';
import { generateErrorMessage } from 'zod-error';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DOMAIN: z.string().default('localhost'),

  GATEWAY_URL: z.string().url(),
  CHAT_WS_URL: z.string(),
  MEDIA_URL: z.string().url(),
  GIT_HASH: z.string(),
  CONNECTING_IP_HEADER: z.string().default('Ddg-Connecting-Country'),

  RECAPTCHA_KEY: z.string(),
  SMARTCAPTCHA_KEY: z.string(),
  RECAPTCHA_DISABLED: z.enum(['true', 'false']).default('false'),

  GGL_APP_ID: z.string(),
  FB_APP_ID: z.string(),
  VK_APP_ID: z.string(),
  YANDEX_APP_ID: z.string(),
  MAIL_APP_ID: z.string(),
  DISCORD_APP_ID: z.string(),
  TELEGRAM_BOT_ID: z.string(),
  DUNS_REGISTERED: z.string().default('0'),

  SOCIAL_REDIRECT: z.string().url(),

  VK_PIXEL: z.string(),
  GOOGLE_TAG_MANAGER_ID: z.string(),
  GOOGLE_ANALYTICS_ID: z.string(),
  METRIKA_APP_ID: z.string(),

  SENTRY_ORG: z.string().default('sentry'),
  SENTRY_PROJECT: z.string().default('frontend'),
  SENTRY_URL: z.string().url().default('https://sentry.reservices.io'),
  SENTRY_DSN: z
    .string()
    .url()
    .default('https://3298b54e5d8eeffc3b34237938de036c@sentry.reservices.io/3'),
  RELEASE_ID: z.string().default(v4()),

  POSTHOG_KEY: z.string().optional().default('phc_YFmbDmno5DV4k8VmmqxRI1Pl2NGBUVRF0sZH2joNbyI'),
  POSTHOG_HOST: z.string().optional().default('https://eu.i.posthog.com'),

  DEFAULT_IMAGE_SERVER: z.string(),

  PANEL_URL: z.string().url(),
  ADMIN_URL: z.string(),
  BUG_REPORT_URL: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;
export type PrivateEnvSchema = {}; // Pick<EnvSchema, 'RECAPTCHA_KEY' | 'SENTRY_DSN'>;
export type PublicEnvSchema = Omit<EnvSchema, keyof PrivateEnvSchema>;

let isEnvAlreadyValidated = false;

const env = Object.keys(envSchema.shape).reduce((acc, key) => {
  // @ts-ignore TODO: keyof EnvSchema
  acc[key] = process.env[key];
  return acc;
}, {} as EnvSchema);

if (!isEnvAlreadyValidated) {
  isEnvAlreadyValidated = true;

  const result = envSchema.safeParse(env);

  if (!result.success) {
    if (result.error.issues) {
      console.error('[ENV] Invalid environment variables, check the errors below!');
      console.error(
        generateErrorMessage(result.error.issues, {
          delimiter: { error: '\\t' },
        })
      );
    }
  }
}

const { NODE_ENV: _NODE_ENV, ...nextEnv } = env;

export { nextEnv as env };
