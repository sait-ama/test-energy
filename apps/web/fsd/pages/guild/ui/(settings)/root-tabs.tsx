'use client';
import type { PropsWithChildren } from 'react';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';

import { useDirDepClub } from '~entities/guild/model/hooks';
import { segments } from '~pages/guild/model/settings-by-dir/consts';
import { Routing } from '~shared/config/routing';
import { Tabs, TabsList, TabsTrigger } from '~shared/hooks/use-swipeable-tabs';

export const RootTabs = ({ children }: PropsWithChildren) => {
  const dir = useDirDepClub();

  const t = useTranslations('pages.guild.settings');

  return (
    <div className="mt-5 flex w-full flex-col gap-4">
      <Tabs>
        <ScrollArea>
          <TabsList className="cs-tabs-list">
            {segments.map(({ segment }) => {
              return (
                <TabsTrigger key={segment} value={segment}>
                  <Link href={Routing.Club.clubByDirSettings({ params: { dir, tab: segment } })}>
                    {t(`${segment}.label`)}
                  </Link>
                </TabsTrigger>
              );
            })}
            <ScrollBar orientation="horizontal" />
          </TabsList>
        </ScrollArea>
      </Tabs>

      <div className="flex-1">{children}</div>
    </div>
  );
};
