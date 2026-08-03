'use client';
import { useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

export const useQueryPrimitiveParams = <TFields extends string | undefined>({
  fieldName,
  onChange,
  defaultValue,
  validatingOptions,
}: {
  fieldName: string;
  validatingOptions?: boolean | ((value?: string) => boolean);
  defaultValue?: string;
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const value = (searchParams.get(fieldName) || defaultValue) as TFields | undefined;

  const createQueryString = useCallback(
    (name: string, value: string | undefined) => {
      const isValid = !validatingOptions
        ? true
        : typeof validatingOptions === 'boolean'
          ? validatingOptions
          : validatingOptions(value);
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, isValid || !defaultValue ? value || '' : defaultValue);
      }
      return params.toString();
    },
    [searchParams, pathName, fieldName, validatingOptions, defaultValue]
  );

  const handleChangeRoute = useCallback(
    (newValue: TFields | undefined) => {
      router.push(`${pathName}?${createQueryString(fieldName, newValue)}`);
    },
    [router, pathName, fieldName, createQueryString]
  );

  return { value, setValue: handleChangeRoute };
};

export const useQueryArrayParams = ({
  fieldName,
  defaultValue = [],
}: {
  fieldName: string;
  defaultValue?: string[];
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.getAll(fieldName) || defaultValue;

  const createQueryString = useCallback(
    (name: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      values.forEach((val) => {
        params.append(name, val);
      });
      return params.toString();
    },
    [searchParams, pathName, value, fieldName]
  );

  const handleChangeRoute = useCallback(
    (values: string[]) => {
      router.push(`${pathName}?${createQueryString(fieldName, values)}`);
    },
    [router, pathName, searchParams]
  );

  const pushValue = useCallback(
    (newValue: string) => {
      if (!value.includes(newValue)) {
        handleChangeRoute([...value, newValue]);
      }
    },
    [value, handleChangeRoute]
  );

  const deleteValue = useCallback(
    (valueToRemove: string) => {
      handleChangeRoute(value.filter((val) => val !== valueToRemove));
    },
    [value, handleChangeRoute]
  );

  const setValue = useCallback(
    (newValues: string[]) => {
      handleChangeRoute(newValues);
    },
    [handleChangeRoute]
  );

  return {
    value,
    pushValue,
    deleteValue,
    setValue,
  };
};

export const useQueryParamsV2 = <TFields extends Record<string, string | undefined>>({
  defaultValues,
  validatingOptions,
}: {
  defaultValues?: Partial<TFields>;
  validatingOptions?: Record<string, boolean | ((value?: string) => boolean)>;
} = {}) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  // @ts-ignore
  const values = Object.keys(defaultValues || {}).reduce<TFields>((acc, key) => {
    acc[key] = searchParams.get(key) || defaultValues?.[key];
    return acc;
  }, {}) as Partial<TFields>;

  const createQueryString = useCallback(
    (newValues: Partial<TFields>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newValues).forEach(([name, value]) => {
        const isValid = !validatingOptions?.[name]
          ? true
          : typeof validatingOptions[name] === 'boolean'
            ? validatingOptions[name]
            : validatingOptions[name]?.(value);

        if (!value) {
          params.delete(name);
        } else {
          params.set(name, isValid || !defaultValues?.[name] ? value || '' : defaultValues[name]);
        }
      });
      return params.toString();
    },
    [searchParams, pathName, validatingOptions, defaultValues]
  );

  const handleChangeRoute = useCallback(
    (newValues: Partial<TFields>) => {
      router.push(`${pathName}?${createQueryString(newValues)}`);
    },
    [router, pathName, createQueryString]
  );

  return { values, setValues: handleChangeRoute };
};
