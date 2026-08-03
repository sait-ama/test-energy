'use client';

import { createContext } from '@re/core/utils/create-context';

import type { SiteConfig } from '~shared/config/constants';

// todo: it is imported in lower layers, move to shared?
const { Provider: SiteConfigProvider, useStore: useSiteConfig } = createContext<
  SiteConfig,
  SiteConfig
>((config) => config, 'SiteConfigStore');

const useContentType = () => useSiteConfig((v) => v.contentType);

const useFriendlyDomains = () => useSiteConfig((v) => v.friendlyDomains);
interface RequestState {
  headers: Record<string, string>;
}

export { type RequestState, SiteConfigProvider, useContentType, useFriendlyDomains, useSiteConfig };
