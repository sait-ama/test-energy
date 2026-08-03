'use client';

import { use, useCallback, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { CookieService } from '~shared/utils/cookie-service';

export interface AgeSubmittedState {
  ageSubmitted: boolean;
  setAgeSubmitted: (v: { value: boolean; persistValue?: boolean }) => void;
}

export const { Provider: AgeSubmittedProvider, useStore: useAgeSubmitted } = createContext<
  AgeSubmittedState,
  Promise<boolean>
>((promise) => {
  const defaultValue = use(promise);
  const [ageSubmitted, setAgeSubmitted] = useState<boolean>(defaultValue);

  const handleAgeSubmitted = useCallback(
    ({ value, persistValue }: { value: boolean; persistValue?: boolean }) => {
      if (persistValue) {
        CookieService.set('agesubmitted', value);
      }
      setAgeSubmitted(value);
    },
    []
  );

  return {
    ageSubmitted,
    setAgeSubmitted: handleAgeSubmitted,
  };
}, 'AgeSubmittedStore');
