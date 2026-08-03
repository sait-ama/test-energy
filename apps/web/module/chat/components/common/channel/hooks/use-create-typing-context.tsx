import { useMemo } from 'react';

import type { TypingContextType } from '../../../../context/typing-context';

export const useCreateTypingContext = (value: TypingContextType) => {
  const { typing } = value;

  const typingValue = Object.keys(typing || {}).join();

  const typingContext: TypingContextType = useMemo(
    () => ({
      typing,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typingValue]
  );

  return typingContext;
};
