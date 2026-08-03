'use client';

// import { addEventProcessor, captureException } from '@sentry/nextjs';
// import { ResourceLoadError } from '~shared/lib/error-handling/errors';

export const SentryErrorTransformer = () =>
  // addEventProcessor(async (event, hint) => {
  //     const error = hint.originalException as Error;
  //     const chunkLoadRegExp = /Error: Loading (css )?chunk/i; // todo recheck
  //
  //     if (chunkLoadRegExp.test(error.message)) {
  //         captureException(new ResourceLoadError());
  //     }
  //
  //     return event;
  // });
  null;
