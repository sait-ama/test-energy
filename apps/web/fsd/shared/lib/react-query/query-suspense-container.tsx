'use client';
import type { ComponentType, ErrorInfo, ReactElement, ReactNode } from 'react';
import { Suspense, useCallback, useMemo } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { InErrorBoundaryException } from '~shared/lib/error-handling/errors';
import { logger } from '~shared/lib/logger';
import { isApiError } from '~shared/types/api.type-guard';

// Extended error type for better type safety
export interface ExtendedError extends Error {
  detail?: {
    message?: string;
  };
  status?: number;
}

// Error information extraction utility (DRY principle)
const extractErrorInfo = (error: ExtendedError, defaultMessage: string) => {
  let text = error?.detail?.message;
  let status = error?.status;

  if (isApiError(error)) {
    text = error.data.detail.message ?? error.data.detail.server;
    status = error.data.statusCode;
  }

  return {
    text: text ?? defaultMessage,
    status: status ?? 500,
  };
};

// Error content component (Single Responsibility)
interface ErrorDisplayProps {
  text: string;
  status?: number;
  onRetry?: () => void;
  showOverlay?: boolean;
  fallbackContent?: ReactNode;
}

export const ErrorDisplay = ({
  text,
  status,
  onRetry,
  showOverlay = false,
  fallbackContent,
}: ErrorDisplayProps) => {
  const containerClasses = showOverlay
    ? 'absolute inset-0 z-20 flex flex-col items-center justify-center gap-4'
    : 'static inset-0 z-20 flex flex-col items-center justify-center gap-4';

  return (
    <div className="relative w-full">
      {showOverlay && fallbackContent && (
        <div className="mask-linear mask-via-30 z-10">{fallbackContent}</div>
      )}
      <div className={cn(containerClasses)}>
        <div className="text-center">
          {status === 404 && <p className="text-lg font-bold md:text-xl">404</p>}
          <p className="text-md md:text-lg">{text}</p>
        </div>
        {status && status !== 404 && onRetry && <Button onClick={onRetry}>Обновить</Button>}
      </div>
    </div>
  );
};

interface QuerySuspenseContainerProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: FallbackProps) => ReactNode;
  handleError?: boolean;
  contentFallbackRenderClassName?: string;
  suspenseKey?: string;
  onError?: (error: Error, info: ErrorInfo) => void;
}

export const StaticFallback = ({ resetErrorBoundary, error }: FallbackProps) => {
  const t = useTranslations('reusable.errors.default');
  const { text, status } = useMemo(
    () => extractErrorInfo(error as ExtendedError, t('heading')),
    [error, t]
  );

  return <ErrorDisplay text={text} status={status} onRetry={resetErrorBoundary} />;
};

const QuerySuspenseContainer = (props: QuerySuspenseContainerProps) => {
  const {
    children,
    fallback,
    fallbackRender: fallbackRenderProp,
    handleError = true,
    suspenseKey,
    onError: customOnError,
  } = props;
  const t = useTranslations('reusable.errors.default');

  // Memoized error handler (Performance optimization)
  const onError = useCallback(
    (error: Error, info: ErrorInfo) => {
      customOnError?.(error, info);
      if (!handleError) return;

      const err = new InErrorBoundaryException();
      err.stack = info.componentStack ?? '';
      err.cause = error;

      logger.error(err);
    },
    [handleError]
  );

  // Memoized fallback renderer (Performance optimization)
  const fallbackRenderer = useCallback(
    ({ resetErrorBoundary, error }: FallbackProps) => {
      const { text, status } = extractErrorInfo(error as ExtendedError, t('heading'));

      return (
        <ErrorDisplay
          text={text}
          status={status}
          onRetry={resetErrorBoundary}
          showOverlay
          fallbackContent={fallback}
        />
      );
    },
    [fallback, t]
  );

  // Use provided fallback renderer or default one
  const finalFallbackRender = fallbackRenderProp ?? fallbackRenderer;

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ReactErrorBoundary onReset={reset} onError={onError} fallbackRender={finalFallbackRender}>
          <Suspense fallback={fallback} key={suspenseKey}>
            {children}
          </Suspense>
        </ReactErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

function withQuerySuspenseContainer<T extends Record<string, unknown>>(
  Component: ComponentType<T>,
  Fallback?: ReactElement,
  fallbackRender?: (props: FallbackProps) => ReactNode
) {
  return function WithQuerySuspenseContainer(props: T) {
    return (
      <QuerySuspenseContainer fallback={Fallback} fallbackRender={fallbackRender}>
        <Component {...props} />
      </QuerySuspenseContainer>
    );
  };
}

export { QuerySuspenseContainer, withQuerySuspenseContainer };
