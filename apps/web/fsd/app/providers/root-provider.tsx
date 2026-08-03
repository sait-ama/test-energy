'use client';

import React, { PropsWithChildren } from 'react';
import { Formats } from 'next-intl';

import { AbstractIntlMessages } from 'use-intl';

import { SentryExtraArgsTheme } from '~app/providers/sentry-extra-args-theme';
import { Locale } from '~shared/i18n';
import { BottomActionsRootProvider } from '~shared/lib/bottom-bar/use-bottom-actions';

import { LocalizationProvider } from './localization-provider';
import { ThemeProvider } from './theme-provider';

export function RootProvider({
  children,
  locale = Locale.RU,
  formats,
  messages,
}: PropsWithChildren<{
  locale: Locale;
  formats: Formats;
  messages: AbstractIntlMessages;
}>) {
  return (
    <LocalizationProvider formats={formats} locale={locale} messages={messages}>
      <ThemeProvider>
        <BottomActionsRootProvider>{children}</BottomActionsRootProvider>
        <SentryExtraArgsTheme />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
