import { captureRequestError } from '@sentry/nextjs';
import { registerOTel } from '@vercel/otel';

import { noop } from '~shared/utils/noop';

export async function register() {
  registerOTel();

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.SENTRY_ENABLED === '1') {
      await import('./sentry.server.config');
    }
    if (process.env.NODE_ENV === 'production') {
      await import('./instrumentation-node');
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge' && process.env.SENTRY_ENABLED === '1') {
    await import('./sentry.edge.config');
  }
}

let handleRequestError: Function = noop;

if (process.env.SENTRY_ENABLED === '1') {
  handleRequestError = captureRequestError;
}

export const onRequestError = handleRequestError;
