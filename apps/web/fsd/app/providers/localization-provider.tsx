import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { Formats, NextIntlClientProvider } from 'next-intl';

import DayJS from 'dayjs';
import dayjs from 'dayjs';
import DayJSCustomParseFormat from 'dayjs/plugin/customParseFormat';
import DayJSTimezone from 'dayjs/plugin/timezone';
import DayJSUtc from 'dayjs/plugin/utc';
import type { AbstractIntlMessages } from 'use-intl';
import { IntlErrorCode } from 'use-intl';
import type { RichTranslationValues } from 'use-intl/dist/types/src/core';
import type IntlError from 'use-intl/dist/types/src/core/IntlError';

import type { Locale } from '~shared/i18n';

type OnErrorProps = { code: string };
const onError = (_: OnErrorProps) => {
  // logger.error(_);
};

function getMessageFallback(
  {
    // namespace,
    key,
    error,
  }: {
    error: IntlError;
    key: string;
    namespace?: string;
  }
  // locale: string,
) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // const error = `Нет ключа "${key}" в ${namespace} в ${locale} локализации`;
    // toast.error(error);
    // console.warn(error);
    return;
  }

  return key;
}

const defaultTranslationValues = {
  b: (chunk: ReactNode) => <b>{chunk}</b>,
  i: (chunk: ReactNode) => <i>{chunk}</i>,
} satisfies RichTranslationValues;

const locales: Record<Locale, () => Promise<unknown>> = {
  ru: () => import(`dayjs/locale/ru`),
  en: () => import(`dayjs/locale/en`),
};

DayJS.extend(DayJSUtc);
DayJS.extend(DayJSTimezone);
DayJS.extend(DayJSCustomParseFormat);

export const LocalizationProvider = ({
  children,
  formats,
  locale,
  messages,
}: {
  children: ReactNode;
  formats: Formats;
  locale: Locale;
  messages: AbstractIntlMessages;
}) => {
  useEffect(() => {
    const loadLocale = locales[locale];
    loadLocale().then(() => dayjs.locale(locale));
  }, []);

  return (
    <NextIntlClientProvider
      defaultTranslationValues={defaultTranslationValues}
      onError={onError}
      formats={formats}
      getMessageFallback={(props) => getMessageFallback(props, locale)}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
};
