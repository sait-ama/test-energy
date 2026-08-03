import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import createStatoscope from 'next-statoscope';

import createBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig as createSentryConfig } from '@sentry/nextjs';

// import createPWA from 'next-pwa';
import { config } from './config/next/config';
// const defaultRuntimeCaching = require("next-pwa/cache");

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// @ts-ignore
const withStatoscope = createStatoscope({
  enabled: process.env.ANALYZE === 'true',
});

// const withPWA = createPWA({
//     dest: 'public',
//     disable: process.env.NODE_ENV !== 'production',
//     register: true,
//     skipWaiting: true,
// });

const withNextIntl = createNextIntlPlugin('./app/i18n.ts');
const withSentryConfig = (config: NextConfig) =>
  createSentryConfig(config, {
    org: 'sentry',
    project: 'frontend',
    sentryUrl: 'https://sentry.reservices.io',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    telemetry: false,
    // widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    widenClientFileUpload: false,
    reactComponentAnnotation: {
      enabled: true,
    },
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
      excludeReplayShadowDom: true,
      excludeReplayIframe: true,
    },
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
      ignore: ['node_modules'],
    },
  });

export default function createConfig() {
  const plugins: ((...params: any[]) => Record<string, unknown>)[] = [withNextIntl];

  if (process.env.ANALYZE === 'true') {
    plugins.push(withBundleAnalyzer, withStatoscope);
  }

  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_ENABLED === '1') {
    plugins.push(withSentryConfig);
  }

  return plugins.reduce((acc, next) => next(acc), config);
}
