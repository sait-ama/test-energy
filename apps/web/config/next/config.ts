import type { NextConfig } from 'next';

import { v4 } from 'uuid';

import { env } from './env';
import { headers } from './headers';
import { images } from './image';
import { redirects } from './redirects';
import { rewrites } from './rewrites';

const isProd = process.env.NODE_ENV === 'production';

export const config: NextConfig = {
  assetPrefix: isProd ? `/_static/${process.env.GIT_HASH}` : undefined,
  cacheHandler: isProd ? require.resolve('../../cache-handler.mjs') : undefined,
  cacheMaxMemorySize: isProd ? 0 : 50 * 1024,
  reactStrictMode: false,
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: true,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  generateBuildId: async () => {
    return process.env.GIT_HASH ?? v4();
  },
  expireTime: 0,
  serverExternalPackages: [
    // '@opentelemetry/api',
    // '@opentelemetry/auto-instrumentations-node',
    // '@opentelemetry/exporter-metrics-otlp-http',
    // '@opentelemetry/exporter-prometheus',
    // '@opentelemetry/exporter-trace-otlp-http',
    // '@opentelemetry/host-metrics',
    // '@opentelemetry/instrumentation',
    // '@opentelemetry/instrumentation-http',
    // '@opentelemetry/instrumentation-runtime-node',
    // '@opentelemetry/resource-detector-container',
    // '@opentelemetry/resources',
    // '@opentelemetry/sdk-metrics',
    // '@opentelemetry/sdk-node',
    // '@opentelemetry/semantic-conventions',
    'next-pwa',
    'redis',
    'sharp',
    'workbox-core',
    'workbox-expiration',
    'workbox-routing',
    'workbox-strategies',
  ],
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    // dynamicIO: true,
    // ppr: 'incremental',
    optimizeServerReact: true,
    gzipSize: true,
    // useCache: true,
    parallelServerCompiles: true,
    webpackMemoryOptimizations: true,
    serverMinification: true,
    scrollRestoration: true,
    // preloadEntriesOnStart: false,
    webpackBuildWorker: true,
    staleTimes: {
      dynamic: 30, // defaults to 0
    },
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'newfront',
        'newfront:3000',
        'mirror_newfront',
        'mirror_newfront:3000',
        're_mainradix:3000',
        're_mainradix1:3000',
        're_radix:3000',
      ],
    },
    optimizePackageImports: [
      'motion/react',
      '@sentry/nextjs',
      'async',
      'lexical',
      'country-flag-icons',
      'react-phone-number-input',
      '@emoji-mart/data',
      '@emoji-mart/react',
      '@lexical/react',
      '@lexical/link',
      '@lexical/list',
      '@lexical/code',
      '@lexical/rich-text',
      '@lexical/selection',
      '@lexical/utils',
      '@lexical/html',
      '@lexical/markdown',
      '@dnd-kit/core',
      '@dnd-kit/modifiers',
      'html-react-parser',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images,
  rewrites,
  redirects,
  headers,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.test\.tsx?$/,
      use: 'ignore-loader',
    });

    // config.cache = {
    //     type: 'filesystem',
    //     compression: 'gzip',
    //     allowCollectingMemory: true,
    // };

    return config;
  },
  env,
};
