import {
  addBreadcrumb,
  captureException,
  captureMessage,
  type SeverityLevel,
} from '@sentry/nextjs';

import { isInScope, LogLevel, type Transport, TransportScope } from '@re/core/lib/logger';

const sentryTransportScope: TransportScope = {
  exclude: ['local'],
};

export const sentryTransport: Transport = (level, message, { type, tags, scope, ...metadata }) => {
  if (!isInScope(scope, sentryTransportScope)) return;

  const severityMap: { [key in LogLevel]: SeverityLevel } = {
    [LogLevel.Debug]: 'debug',
    [LogLevel.Info]: 'info',
    [LogLevel.Log]: 'log',
    [LogLevel.Warn]: 'warning',
    [LogLevel.Error]: 'error',
    [LogLevel.Fatal]: 'fatal',
  };

  const severity = severityMap[level];

  /**
   * If a string, report a breadcrumb
   */
  if (typeof message === 'string') {
    addBreadcrumb({
      message,
      data: metadata,
      type: type || 'default',
      level: severity,
      timestamp: Date.now(),
    });

    /**
     * If a log, also capture as a message
     */
    if (level === LogLevel.Log) {
      captureMessage(message, {
        tags,
        extra: metadata,
      });
    }

    /**
     * If warn, also capture as a message, but with level warning
     */
    if (level === LogLevel.Warn) {
      captureMessage(message, {
        level: severity,
        tags,
        extra: metadata,
      });
    }
  } else {
    /**
     * It's otherwise an Error and should be reported as onReady
     */
    captureException(message, {
      tags,
      extra: metadata,
    });
  }
};
