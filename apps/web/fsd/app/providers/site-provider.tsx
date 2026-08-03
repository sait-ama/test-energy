'use client';

import { memo, ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { SiteConfigProvider } from '~app/providers/site-config-provider';
import { getQueryClient } from '~shared/api/react-query';
import type { SiteConfig } from '~shared/config/constants';

interface AppRootProvider {
  children: ReactNode;
  domainConfig: SiteConfig;
}

export const SiteProvider = memo((props: AppRootProvider) => {
  const queryClient = getQueryClient();
  const { children, domainConfig } = props;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        <NuqsAdapter>
          <SiteConfigProvider value={domainConfig}>{children}</SiteConfigProvider>
        </NuqsAdapter>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
});
