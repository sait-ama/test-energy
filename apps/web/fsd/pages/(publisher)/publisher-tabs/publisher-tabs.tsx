'use client';

import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { isServer } from '@tanstack/query-core';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { usePublisherProfileAbility } from '~entities/publisher/model/hooks';
import { Error403 } from '~features/error-view/ui/error-403';
import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';
import ProfileTab = Routing.Publisher.ProfileTab;

export const PublisherTabs = ({
  children,
  initialAbility,
}: PropsWithChildren & { initialAbility: string[] }) => {
  const params = useParams<{ dir: string }>();
  const tab = (useSelectedLayoutSegment() as ProfileTab) || 'about';
  const dir = params.dir;
  const t = useTranslations('publisher.segments.profile-layout');
  const _ability = usePublisherProfileAbility();
  const tabs = (isServer ? initialAbility : _ability.getSubjectsForAction('read')) as ProfileTab[]; // todo: do not show 'Тайтлы' tab if publisher does not have them

  const canViewCurrentTab = tab && _ability.can('read', tab);
  const [state, setState] = useControllableState({
    prop: tab,

    // onChange: (tab) => router.push(Routing.Publisher.detail({ dir, tab })),
  });

  return (
    // @ts-ignore
    <Tabs activationMode="manual" value={state} onValueChange={setState}>
      <ScrollArea className="px-2">
        <TabsList>
          {tabs.map((v) => (
            <TabsTrigger asChild key={v} value={v}>
              <Link
                shallow={false}
                prefetch={false}
                href={Routing.Publisher.detail({ params: { dir, tab: v } })}
              >
                {t(`${v}.title`)}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent key={tab} className="mt-4 flex flex-col" value={tab}>
        {useMemo(
          () =>
            !canViewCurrentTab ? (
              <Error403
                className="translate-y-full self-center"
                withImage
                abort={Routing.Publisher.detail({ params: { dir, tab: 'about' } })}
              />
            ) : (
              children
            ),
          [canViewCurrentTab, tab]
        )}
      </TabsContent>
    </Tabs>
  );
};
