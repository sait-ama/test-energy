import { cache, ReactNode, Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { unstable_cache } from 'next/cache';
import { Exo_2 } from 'next/font/google';
import { getMessages } from 'next-intl/server';

import { cn } from '@re/ui-kit/utils/cn'; // import { client } from '@re/api/generated/client.gen';
import { getTraceData } from '@sentry/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from '~app/providers/auth-provider';
import { BottomActions } from '~app/providers/bottom-actions';
import { HeroCardControlsGlobalServerProvider } from '~app/providers/hero-card-controls-provider';
import { InQueryNotification } from '~app/providers/in-query-notification';
import { RootProvider } from '~app/providers/root-provider';
import { SiteProvider } from '~app/providers/site-provider';
import { DunsRegistered } from '~app/scripts/duns-registration';
import { GoogleAnalyticsScript } from '~app/scripts/google-analytics';
import { GoogleTagScript } from '~app/scripts/google-tag';
import { PolyfillsScripts } from '~app/scripts/polyfills-scripts';
import { TelegramWidgetScript } from '~app/scripts/telegram-widget';
import { VkPixelScript } from '~app/scripts/vk-pixel';
import { YandexMetrikaScript } from '~app/scripts/yandex-metrika';
import { NewVersionTourToast } from '~features/(tour)/new-version-tour';
import { ProdOnly } from '~shared/config/helpers';
import { getSiteConfig } from '~shared/config/site-config';
import { Locale } from '~shared/i18n';
import { getEvent } from '~shared/lib/event-management/get-event';
import { PageViewHit } from '~shared/lib/metrics/yandex-metrika/page-view-hit';
import { TourProvider } from '~shared/lib/tour/root';
import { EnvScript, publicEnv } from '~shared/utils/env';

import { Profiler } from './_profiler';
import { RootLd } from './_root-ld';
import { CookieConsentToast, TelegramPromoToast } from './toasts';

import './global.css';

// import '~shared/lib/react/why-did-you-update';
const isDev = process.env.NODE_ENV !== 'production';

const font = Exo_2({
  weight: 'variable',
  variable: '--r-font',
  style: ['normal', 'italic'],
  preload: true,
  subsets: ['cyrillic', 'latin'],
});

export const generateMetadata = async () => {
  const domainConfig = getSiteConfig()!;

  return {
    metadataBase: new URL(domainConfig.routing.url),
    appleWebApp: {
      title: domainConfig.site.name,
      capable: true,
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      ...getTraceData(),
    },
  } satisfies Metadata;
};

export const generateViewport = async () => {
  const domainConfig = getSiteConfig()!;

  return {
    themeColor: domainConfig.theme.backgroundColor,
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  } satisfies Viewport;
};

export interface RootLayoutProps {
  children: ReactNode;
}
const getI18nMessagesWithoutCache = async (locale: Locale) => {
  return await getMessages({ locale });
};
const getI18nMessages = isDev
  ? getI18nMessagesWithoutCache
  : unstable_cache(
      cache(async (locale: Locale) => {
        return await getMessages({ locale });
      }),
      ['locale'],
      {
        revalidate: 3600,
      }
    );
const Toasts = () => {
  return (
    <Suspense fallback={null}>
      <CookieConsentToast />
      <TelegramPromoToast />
      <NewVersionTourToast />
      <InQueryNotification />
      {/*<WelcomeToast />*/}
    </Suspense>
  );
};

const Body = async ({ children }: RootLayoutProps) => {
  const domainConfig = getSiteConfig()!;
  const messages = await getI18nMessages(domainConfig.localization.locale);

  return (
    <Profiler id="requst-state">
      <Profiler id="site-provider">
        <SiteProvider domainConfig={domainConfig}>
          <Profiler id="auth-provider">
            <AuthProvider>
              <body className={cn('bg-background text-foreground antialiased', font.className)}>
                <TourProvider>
                  <HeroCardControlsGlobalServerProvider>
                    <RootProvider
                      messages={messages}
                      locale={domainConfig.localization.locale}
                      formats={domainConfig.localization.formats}
                    >
                      {/*<VersionCacheProvider>*/}
                      <Profiler id="page">{children}</Profiler>

                      <RootLd />
                      <BottomActions />
                      <Toasts />

                      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />

                      {/*</VersionCacheProvider>*/}
                    </RootProvider>
                  </HeroCardControlsGlobalServerProvider>
                </TourProvider>
              </body>
            </AuthProvider>
          </Profiler>
        </SiteProvider>
      </Profiler>
    </Profiler>
  );
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const domainConfig = getSiteConfig()!;
  const event = getEvent();
  return (
    <html
      data-theme-event={event}
      data-override-theme="false"
      lang={domainConfig.localization.localeCode}
      suppressHydrationWarning // needed for next-themes
    >
      <head>
        {publicEnv('NODE_ENV') === 'development' ? (
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        ) : null}
        <meta charSet="utf-8" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="alternate"
          hrefLang={domainConfig.localization.localeCode}
          href={domainConfig.routing.url}
        />
        <Profiler id="env">
          <Suspense>
            <EnvScript />
          </Suspense>
          <ProdOnly>
            <VkPixelScript />
            <YandexMetrikaScript />
            <GoogleTagScript />
            <GoogleAnalyticsScript />
            <DunsRegistered />
          </ProdOnly>
          <PageViewHit />
          <PolyfillsScripts />
          <TelegramWidgetScript />
        </Profiler>
      </head>
      <Profiler id="body">
        <Body>{children}</Body>
      </Profiler>
    </html>
  );
}
