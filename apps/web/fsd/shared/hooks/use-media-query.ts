'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

export function useMediaQuery<T extends true | false | undefined = boolean>(
  query: string,
  options?: {
    defaultValue?: T;
  }
) {
  const [value, setValue] = React.useState(!options ? false : options?.defaultValue);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => {
      result.removeEventListener('change', onChange);
    };
  }, [query]);

  return value;
}

export const useScreenSuspense = (query: string): boolean => {
  const clientMedia = useMediaQuery(query, { defaultValue: undefined });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: matches } = useSuspenseQuery({
    queryKey: [`screen`, { query }],
    queryFn: async () => {
      if (typeof window === 'undefined') {
        return false;
      }

      return new Promise<boolean>((resolve) => {
        const mediaQueryList = window.matchMedia(query);

        const documentChangeHandler = () => resolve(mediaQueryList.matches);

        documentChangeHandler();

        mediaQueryList.addEventListener('change', documentChangeHandler);

        return () => mediaQueryList.removeEventListener('change', documentChangeHandler);
      });
    },
  });
  return !isMounted ? false : clientMedia === undefined ? matches : clientMedia;
};
