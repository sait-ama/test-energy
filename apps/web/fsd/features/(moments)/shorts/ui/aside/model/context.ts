'use client';

import { useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { ASIDE } from './constants';

const { Provider: ShortsAsideProvider, useStore: useShortsAside } = createContext(() => {
  const [state, setState] = useState<null | ASIDE>(null);

  const close = () => {
    setState(null);
  };

  const toggle = (value: null | ASIDE) => {
    const newValue = state === value ? null : value;
    setState(newValue);
  };

  return {
    state,
    close,
    toggle,
    open: setState,
  };
});

export { ShortsAsideProvider, useShortsAside };
