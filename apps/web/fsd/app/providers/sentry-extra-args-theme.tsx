import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { setExtra } from '@sentry/nextjs';

export const SentryExtraArgsTheme = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setExtra('theme', resolvedTheme);
  }, [resolvedTheme]);

  return null;
};
