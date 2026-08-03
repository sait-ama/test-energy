import { ReactNode } from 'react';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SiteConfigProvider } from '~app/providers/site-config-provider';
import { SiteConfig } from '~shared/config/constants';
import { Locale } from '~shared/i18n';
import { AgeSubmittedProvider } from '~shared/lib/age-submit/use-age-submitted';
import { AuthModalProvider } from '~shared/lib/auth/use-auth-modal';
import { BottomActionsRootProvider } from '~shared/lib/bottom-bar/use-bottom-actions';
import { SessionProvider } from '~shared/lib/session/use-session';

// Mock query client for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock site config
const mockSiteConfig = {
  contentType: 'anime',
  site: {
    name: 'Test Site',
    domain: 'test.com',
    logo: '/logo.png',
  },
  routing: {
    url: 'https://test.com',
    title: '/:slug',
    titles: '/anime',
    user: '/user/:id',
    search: '/search',
  },
  seo: {
    meta: {
      defaultImage: 'https://test.com/og.png',
    },
  },
  integrations: {
    analytics: {
      enabled: false,
    },
    sentry: {
      enabled: false,
    },
  },
  auth: {
    enabled: false,
  },
  localization: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
  },
  theme: {
    defaultTheme: 'light',
  },
  entries: {
    enabled: false,
  },
  features: {
    search: true,
    bookmarks: true,
  },
  articles: {
    enabled: false,
  },
} as unknown as SiteConfig;

// Mock messages for internationalization
const mockMessages: AbstractIntlMessages = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
  },
  title: {
    rating: 'Rating',
    episodes: 'Episodes',
    status: 'Status',
  },
};

// Mock session data
const mockSession = Promise.resolve({
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  },
  isAuthenticated: true,
});

const mockAgeSubmitted = Promise.resolve(true);

interface Session {
  user: {
    id: number;
    username: string;
    email: string;
  };
  isAuthenticated: boolean;
}

interface TestProvidersProps {
  children: ReactNode;
  locale?: Locale;
  siteConfig?: Partial<SiteConfig>;
  messages?: AbstractIntlMessages;
  queryClient?: QueryClient;
  session?: Promise<Session>;
  ageSubmitted?: Promise<boolean>;
}

export function TestProviders({
  children,
  locale = Locale.RU,
  siteConfig = {},
  messages = mockMessages,
  queryClient,
  session = mockSession,
  ageSubmitted = mockAgeSubmitted,
}: TestProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient();
  const finalSiteConfig = { ...mockSiteConfig, ...siteConfig };

  return (
    <QueryClientProvider client={testQueryClient}>
      <SiteConfigProvider value={finalSiteConfig}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Moscow">
          <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <BottomActionsRootProvider>
              <AuthModalProvider>
                <SessionProvider value={session as any}>
                  <AgeSubmittedProvider value={ageSubmitted}>{children}</AgeSubmittedProvider>
                </SessionProvider>
              </AuthModalProvider>
            </BottomActionsRootProvider>
          </NextThemesProvider>
        </NextIntlClientProvider>
      </SiteConfigProvider>
    </QueryClientProvider>
  );
}

// Helper function to render components with all providers
export function renderWithProviders(options: Omit<TestProvidersProps, 'children'> = {}) {
  return {
    ...options,
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestProviders {...options}>{children}</TestProviders>
    ),
  };
}

// Mock data factories for tests
export const mockTitleData = {
  id: 1,
  slug: 'test-title',
  main_name: 'Test Title',
  secondary_name: 'テストタイトル',
  description: 'This is a test title description',
  type: 'anime',
  status: 'released',
  rating: 8.5,
  year: 2023,
  episodes_count: 12,
  cover: {
    sm: 'https://test.com/covers/sm.jpg',
    md: 'https://test.com/covers/md.jpg',
    lg: 'https://test.com/covers/lg.jpg',
    mid: 'https://test.com/covers/mid.jpg',
  },
  explicit: false,
};

export const mockHorizontalCardProps = {
  model: mockTitleData,
  onClick: () => {},
  size: 'md' as const,
  getHref: (_contentType: string, title: typeof mockTitleData) => `/anime/${title.slug}`,
};
