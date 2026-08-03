import { Logger } from '@re/core/lib/logger';

import { consoleTransport } from './transports/console-transport';

/**
 * Basic usage:
 *
 *   `logger.debug(message[, metadata, debugContext])`
 *   `logger.info(message[, metadata])`
 *   `logger.warn(message[, metadata])`
 *   `logger.error(error[, metadata])`
 *   `logger.disable()`
 *   `logger.enable()`
 */
export const logger = new Logger();

/**
 * Report to console in dev, Sentry in prod, nothing in test.
 */
// @ts-ignore
if (process.env.NODE_ENV === 'development') {
  logger.addTransport(consoleTransport);
  /**
   * Uncomment this to test Sentry in dev
   */
  // logger.addTransport(sentryTransport);
} else {
  // logger.addTransport(sentryTransport);
}
