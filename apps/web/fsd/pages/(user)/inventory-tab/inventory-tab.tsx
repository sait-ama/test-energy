'use client';

import React, { memo, ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { useTourItem } from '~shared/lib/tour/items';

import { useInventoryTabs } from './hooks/use-inventory-tabs';
import { InventoryTab as InventoryTabName } from './model/const';
import { getProvider } from './store/inventory-store';

const CustomizationActions = dynamic(() =>
  import('./ui/customization/customization-actions').then((m) => m.CustomizationActions)
);
const CustomizationTab = dynamic(() =>
  import('./ui/customization/fabric').then((m) => m.CustomizationTab)
);
const DecksTab = dynamic(() => import('./ui/decks-tab').then((m) => m.DecksTab));
const HeroCardsActions = dynamic(() =>
  import('./ui/hero-cards-actions').then((m) => m.HeroCardsActions)
);
const HeroCardsTab = dynamic(() => import('./ui/hero-cards-tab').then((m) => m.HeroCardsTab));

const MomentsTab = dynamic(() =>
  import('~pages/(user)/inventory-tab/ui/moments-tab').then((m) => m.MomentsTab)
);
const CollectionsTab = dynamic(() =>
  import('~pages/(user)/inventory-tab/ui/collection-cards-tab/ui/collections-cards-tab').then(
    (m) => m.CollectionsCardsTab
  )
);
const CollectionCardsActions = dynamic(() =>
  import('~pages/(user)/inventory-tab/ui/collection-cards-tab/ui/collection-cards-actions').then(
    (m) => m.CollectionCardsActions
  )
);

const ItemTab = memo((props: { tab: string }) => {
  const { tab } = props;

  switch (tab) {
    case InventoryTabName.MOMENTS:
      return <MomentsTab />;
    case InventoryTabName.CUSTOMIZATION:
      return <CustomizationTab />;
    case InventoryTabName.DECKS:
      return <DecksTab />;
    case InventoryTabName.COLLECTIONS:
      return <CollectionsTab />;
    case InventoryTabName.CARDS:
    default:
      return <HeroCardsTab />;
  }
});

const ItemTabActions = (props: { tab: string }) => {
  const { tab } = props;

  switch (tab) {
    case InventoryTabName.CARDS:
      return <HeroCardsActions />;
    case InventoryTabName.CUSTOMIZATION:
      return <CustomizationActions />;
    case InventoryTabName.COLLECTIONS:
      return <CollectionCardsActions />;
    default:
      return null;
  }
};

interface InventoryTabsProps {
  actions?: ReactNode;
}

const InventoryTabs = (props: InventoryTabsProps) => {
  const { actions } = props;
  const { tab, setTab, tabs } = useInventoryTabs();
  const userInventoryTabsTourProps = useTourItem('user-inventory-tabs');
  const t = useTranslations('user.pages.inventory.tabs');

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="cs-inventory-tabs-root flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"
    >
      <ScrollArea>
        <ScrollBar orientation="horizontal" />
        <TabsList
          color="secondary"
          className="cs-inventory-tabs-list"
          {...userInventoryTabsTourProps}
        >
          {tabs.map((value) => (
            <TabsTrigger
              key={value}
              color="secondary"
              value={value}
              className="cs-inventory-tabs-item"
            >
              {t(value)}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>
      {actions}
    </Tabs>
  );
};

export const InventoryTab = () => {
  const { tab } = useInventoryTabs();
  const InventoryProvider = getProvider(tab!);

  return (
    <InventoryProvider>
      <div className="flex flex-col gap-3">
        <InventoryTabs
          actions={
            <Suspense fallback={null}>
              <ItemTabActions tab={tab!} />
            </Suspense>
          }
        />
        <QuerySuspenseContainer fallback={<div className="h-[40vh]" />}>
          <ItemTab tab={tab} />
        </QuerySuspenseContainer>
      </div>
    </InventoryProvider>
  );
};
