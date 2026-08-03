import type { FieldValues, Path, Resolver, UseFormReturn } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

import { anchorBasedRegex } from '~shared/lib/form/regexp';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { isJson } from '~shared/utils/is-json';
import { parseJson } from '~shared/utils/parse-json';

export const createTransformedResolver = <T extends FieldValues>(
  schema: ZodSchema<T>,
  transformFormValues: (values: FieldValues) => T
): Resolver<T> => {
  return async (values: FieldValues, context: unknown, options: unknown) => {
    const transformedValues = transformFormValues(values);
    return zodResolver(schema)(transformedValues, context, options);
  };
};
export type ErrorResolver<
  T extends string = string,
  TFieldValues extends FieldValues = FieldValues,
> = (field: T, fields: T[]) => keyof TFieldValues | false;

export const useErrorTransformer =
  <TFieldValues extends FieldValues = FieldValues>({
    form,
  }: {
    form: UseFormReturn<TFieldValues>;
  }) =>
  <T extends string = string>(
    error: BackendValidationError,
    resolver?: ErrorResolver<T>,
    ignoreRegistered = false,
    splitKeyAndMessage = false
  ) => {
    let rootMessage = '';
    const registeredFields = Object.keys(form.getValues()) as T[];

    for (const key in error.detail as Record<T, unknown>) {
      const message = error?.detail?.[key]?.replace?.(anchorBasedRegex, '');

      const resolvedKey = (resolver?.(key, registeredFields) || key) as T;
      const keyInForm = registeredFields.includes(resolvedKey);
      if (message) {
        rootMessage +=
          splitKeyAndMessage && resolvedKey !== 'server' ? `${resolvedKey}: ${message}` : message;
        if (keyInForm && !ignoreRegistered) {
          form.setError(resolvedKey as Path<TFieldValues>, { message });
        }
      }
    }

    return rootMessage;
  };

export const transformErrorDetail = (error: BackendValidationError) => {
  let rootMessage = '';

  for (const key in error.detail) {
    const message = error.detail[key];
    rootMessage += `${message}\n\r`;
  }

  return rootMessage;
};

export const getError = (e: Error, fallback?: BackendValidationError) => {
  if (isJson(e.message) && isBackendValidationError(parseJson<BackendValidationError>(e.message))) {
    const error = parseJson<BackendValidationError>(e.message)!;
    const message = transformErrorDetail(error);
    const code = error.statusCode;
    return {
      message: message || 'Произошла ошибка. Обратитесь в тех. поддержку',
      statusCode: code,
    };
  }

  return { statusCode: 500, message: `Произошла непредвиденная ошибка`, ...fallback };
};
