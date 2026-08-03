'use client';

import { useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

interface UseQueryStateParams<T extends NumberIsomorphic, K extends NumberIsomorphic> {
  key: string;
  defaultValue: string;
  variants?: string[];
  validate?: (value: string) => boolean;
  serializer?: (value: T) => K;
  deserializer?: (value: K) => T;
}

export const useQueryState = <T extends NumberIsomorphic, K extends NumberIsomorphic = T>(
  options: UseQueryStateParams<T, K>
) => {
  const {
    key,
    defaultValue,
    validate,
    variants,
    serializer = String,
    deserializer = String,
  } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const value = useMemo(() => {
    const newValue = searchParams.get(key);

    //@ts-ignore
    if (
      !newValue ||
      (variants && !variants.includes(newValue)) ||
      (validate && !validate(newValue))
    )
      return defaultValue;

    return newValue;
  }, [searchParams]);

  const prevValueRef = useRef(value);

  const handleSetState = (
    newValue: T | ((value: T) => T),
    method: 'replace' | 'push' = 'replace'
  ) => {
    const actualNewValue =
      typeof newValue === 'function' ? newValue(prevValueRef.current) : newValue;
    const serializedNewValue = serializer(actualNewValue);

    prevValueRef.current = serializedNewValue;

    const params = new URLSearchParams(searchParams.toString());

    if (serializedNewValue) {
      params.set(key, serializedNewValue as string);
    } else {
      params.delete(key);
    }

    router[method](`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return [deserializer(value as K) as K, handleSetState] as const;
};
