import type { FieldValues, UseFormReturn } from 'react-hook-form';

import type { ErrorResolver } from '~shared/lib/form/error-handling-base';
import { transformErrorDetail, useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { anchorBasedRegex } from '~shared/lib/form/regexp';
import { isApiError } from '~shared/types/api.type-guard';
import { type importToastAsync } from '~shared/ui/toast/toast.async';

import { logger } from '../logger';

export const resolveUnknownError = async (
  externalToast?: Awaited<ReturnType<typeof importToastAsync>>
) => {
  const toast = (externalToast ||
    (await import('~shared/ui/toast/toast.async').then((v) => v.importToastAsync())))!;
  toast.error(`Произошла непредвиденная ошибка`);
};
export const resolveErrorAsync = async (error: unknown, unknown = false) => {
  const { importToastAsync } = await import('~shared/ui/toast/toast.async');
  const toast = await importToastAsync();
  if (error && isApiError(error) && !unknown) {
    const message = transformErrorDetail(error.data);

    toast.error(`Произошла ошибка${message ? `.\n\r ${message}` : ''}`);

    return;
  }
  await resolveUnknownError(toast);
};

export const useErrorHandler = <TFieldValues extends FieldValues = FieldValues>({
  form,
}: {
  form: UseFormReturn<TFieldValues>;
}) => {
  const resolveErrors = useErrorTransformer({ form });

  return async <T extends string>(
    error: unknown,
    resolver?: ErrorResolver<T, FieldValues>,
    ignoreRegistered = false,
    splitKeys = false
  ) => {
    const { importToastAsync } = await import('~shared/ui/toast/toast.async');
    const toast = await importToastAsync();

    if (error && isApiError(error)) {
      const message = resolveErrors<T>(error.data, resolver, ignoreRegistered, splitKeys).replace(
        anchorBasedRegex,
        ''
      );
      toast.error(message || 'Произошла непредвиденная ошибка. Обратитесь в тех. поддержку');

      return;
    }
    logger.error(error);

    toast.error(`Произошла непредвиденная ошибка. Обратитесь в тех. поддержку`);
  };
};
