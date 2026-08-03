'use client';

import { memo } from 'react';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { cn } from '~shared/utils/cn';

import { useTitlePromoListTabs } from '../model/hooks';

import { TitlePromoBilling } from './title-promo-billing';
import { TitlePromoList } from './title-promo-list';

export interface TitlePromoListPageProps {
  className?: string;
}

export const TitlePromoListPage = memo(({ className }: TitlePromoListPageProps) => {
  const { tab, setTab, tabs } = useTitlePromoListTabs();

  return (
    <div className={cn('flex min-h-screen justify-between', className)}>
      <Tabs
        activationMode="manual"
        value={tab}
        onValueChange={setTab}
        className="flex w-full flex-col gap-2"
      >
        <ScrollArea>
          <TabsList className="cs-tabs-list">
            {tabs.map((it) => (
              <TabsTrigger value={it.value} key={it.value}>
                {it.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="list">
          <TitlePromoList />
        </TabsContent>
        <TabsContent value="billing">
          <TitlePromoBilling />
        </TabsContent>
      </Tabs>
    </div>
  );
});
