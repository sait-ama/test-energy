import React from 'react';
import type { FallbackProps } from 'react-error-boundary/dist/declarations/src/types';

import { AuthButton } from '~features/error-view/ui/auth-button';
import { ErrorBase } from '~features/error-view/ui/error-base';
import { useLogged } from '~shared/lib/session/use-logged';
import { isApiError } from '~shared/types/api.type-guard';

export const ReaderErrorView = (props: FallbackProps) => {
  const { error, resetErrorBoundary } = props;
  const isLogged = useLogged();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {isApiError(error) ? (
        <ErrorBase
          status={error.data.statusCode}
          text={
            error.data.statusCode === 401 || !isLogged
              ? 'Чтобы продолжить, нужно войти'
              : (error.data.detail?.server ?? 'Непредвиденная ошибка')
          }
          actions={
            error.data.statusCode === 401 || !isLogged ? (
              <AuthButton onSuccess={resetErrorBoundary} />
            ) : null
          }
        />
      ) : (
        <ErrorBase status={501} text="Кажется, что-то пошло не так..." />
      )}
    </div>
  );
};
