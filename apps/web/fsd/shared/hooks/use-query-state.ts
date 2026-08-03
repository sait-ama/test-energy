'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import { usePreviousValue } from './use-previous-value';

type StringOrNumber = NumberIsomorphic;

interface UseQueryStateParams<T extends StringOrNumber, K extends StringOrNumber> {
  key: string;
  initialValue?: T;
  serializer?: (value: T) => K;
  deserializer?: (value: K) => T;
}

export const useQueryState = <T extends StringOrNumber, K extends StringOrNumber = T>(
  options: UseQueryStateParams<T, K>
) => {
  const { key, initialValue, serializer = String, deserializer = String } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [state, setState] = useState(
    () => (searchParams.get(key) as K | undefined) || serializer(initialValue!)
  );
  const previousValue = usePreviousValue(state);

  const handleSetState = (newValue: T | ((T) => T), method: 'replace' | 'push' = 'replace') => {
    const actualNewValue = typeof newValue === 'function' ? newValue(previousValue) : newValue;
    const serializedNewValue = serializer(actualNewValue);

    const params = new URLSearchParams(searchParams.toString());
    params.set(key, serializedNewValue as string);

    router[method](`${pathname}?${params.toString()}`, {
      scroll: false,
    });

    setState(serializedNewValue);
  };

  return [deserializer(state as K), handleSetState] as const;
};
