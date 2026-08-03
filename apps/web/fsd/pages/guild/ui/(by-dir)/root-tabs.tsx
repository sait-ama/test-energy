'use client';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useDirDepClub } from '~entities/guild/model/hooks';
import { useAvailableSegments } from '~pages/guild/model/by-dir/hooks';
import { Routing } from '~shared/config/routing';

export const RootTabs = ({ children }: PropsWithChildren) => {
  const dir = useDirDepClub();
  const t = useTranslations('pages.guild.profile');
  const selectedSegment = useSelectedLayoutSegment() || 'about';
  const availableSegments = useAvailableSegments();

  return (
    <Tabs
      activationMode="manual"
      value={selectedSegment}
      defaultValue={selectedSegment}
      className="flex flex-col gap-2"
    >
      <ScrollArea className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            {availableSegments.map((tab) => (
              <TabsTrigger asChild key={tab} value={tab}>
                <Link shallow={false} href={Routing.Club.clubByDir({ params: { dir, tab } })}>
                  {t(`${tab}.label`)}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {children}
    </Tabs>
  );
};
