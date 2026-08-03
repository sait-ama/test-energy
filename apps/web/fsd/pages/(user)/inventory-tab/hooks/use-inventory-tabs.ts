'use client';
import { useMemo } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { SiteNames } from '~shared/config/constants';
import { useQueryState } from '~shared/hooks/use-query-state';
import { validateDomain } from '~shared/lib/domain/domain-exclusive';
import { useSession } from '~shared/lib/session/use-session';

import { InventoryTab } from '../model/const';

const DEFAULT_TAB = InventoryTab.CARDS;

interface UseValidTabsOptions {
  userId?: number | null | undefined;
  currentUserId?: number | null | undefined;
}

const useValidTabs = ({ userId, currentUserId }: UseValidTabsOptions) => {
  const siteConfig = useSiteConfig();

  const tabs = useMemo(() => {
    const tabs: InventoryTab[] = [];

    if (
      validateDomain({
        exclude: [SiteNames.ReComics],
        config: siteConfig,
      })
    )
      tabs.push(InventoryTab.CARDS);

    tabs.push(InventoryTab.CUSTOMIZATION);
    tabs.push(InventoryTab.MOMENTS);
    tabs.push(InventoryTab.COLLECTIONS);

    if (currentUserId) {
      tabs.push(InventoryTab.DECKS);
    }

    // if (isLogged && isCurrentUser) tabs.push(InventoryTab.PROMOCODES);

    return tabs;
  }, [userId, siteConfig, currentUserId]);

  return { tabs };
};

export const { Provider: InventoryTabsProvider, useStore: useInventoryTabs } = createContext<
  { tab: InventoryTab; tabs: InventoryTab[]; setTab: (tab: string) => void },
  number
>((userId) => {
  const [tabQuery, setTabQuery] = useQueryState<InventoryTab>({
    key: 'type',
    initialValue: DEFAULT_TAB,
  });

  const currentUser = useSession();

  const { tabs } = useValidTabs({ userId: userId, currentUserId: currentUser?.id });

  const tab = tabs.includes(tabQuery as InventoryTab) ? (tabQuery as InventoryTab) : tabs[0]!;

  const setTab = (tab: string) => {
    setTabQuery(tabs.includes(tab as InventoryTab) ? (tab as InventoryTab) : tabs[0]!);
  };

  return { tab, tabs, setTab };
});
