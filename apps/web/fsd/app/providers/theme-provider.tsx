'use client';

import React, { FC, PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

import { ProgressProvider } from '@bprogress/next/app';
import { setExtra } from '@sentry/nextjs';

import { SnowProvider } from '~app/providers/snow-provider';
import { MediaContextProvider, mediaStyles } from '~shared/lib/media';

export const ThemeProvider: FC<PropsWithChildren<{ forcedTheme?: string }>> = (props) => {
  const { children, forcedTheme } = props;

  useEffect(() => {
    const handleResize = () => {
      setExtra('dimensions', {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    // @ts-ignore
    <NextThemeProvider defaultTheme="system" storageKey="mtheme" forcedTheme={forcedTheme}>
      <MediaContextProvider>
        <ProgressProvider
          height="2px"
          color="hsl(var(--r-primary))"
          options={{ showSpinner: false }}
          shallowRouting
        >
          <SnowProvider>{children}</SnowProvider>
        </ProgressProvider>
      </MediaContextProvider>

      <style type="text/css">{mediaStyles}</style>
    </NextThemeProvider>
  );
};
