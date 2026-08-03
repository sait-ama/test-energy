'use client';
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { ScrollBar } from '@re/ui-kit/ui/shadow-scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';

import { getConfiguration, getTopOrderings } from '~pages/(user)/top/model/const';
import { UserTopItem } from '~pages/(user)/top/user-top-detailed';
import { UserTopOrdering } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import {
  ListItemSkeleton,
  ListTopContentRoot,
  ListTopRoot,
  ListTopThreeRoot,
  TopItemSkeleton,
} from '~shared/ui/item-top';
import { Underline } from '~shared/ui/underline';

export function TopCategoriesListPage() {
  const [ordering, setOrdering] = useState<UserTopOrdering>(UserTopOrdering.VIEWS);
  const { defaultOrderings = [], event } = getTopOrderings();
  const t = useTranslations('pages.user-top.orderings');

  return (
    <div className="flex flex-col items-center gap-8 overflow-visible md:gap-16">
      <div className="flex w-full flex-col gap-6 md:items-center md:justify-center">
        <Underline className="w-fit">
          <ReText className="select-none" size="3xl" weight="bold">
            Топы пользователей
          </ReText>
        </Underline>
        <div className="z-[2000] w-full">
          <ScrollArea>
            <Tabs value={ordering} onValueChange={(v) => setOrdering(v as UserTopOrdering)}>
              <TabsList
                data-theme-event={event || ''}
                variant="pill"
                className="inline-flex min-w-max"
              >
                {event && (
                  <TabsTrigger
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    key={event}
                    value={UserTopOrdering.EVENT_POINTS}
                  >
                    {t(`event.${event}`)}
                  </TabsTrigger>
                )}
                {defaultOrderings.map((value) => (
                  <TabsTrigger
                    className={
                      value === 'event'
                        ? 'data-[state=active]:bg-primary data-[state=active]:text-white'
                        : ''
                    }
                    key={value}
                    value={value}
                  >
                    {t(value)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <ScrollBar className="bottom-[8px] hidden md:flex" orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <Suspense
        fallback={
          <ListTopRoot>
            <ListTopThreeRoot>
              <TopItemSkeleton className="justify-end" />
              <TopItemSkeleton className="justify-start" />
              <TopItemSkeleton className="justify-end" />
            </ListTopThreeRoot>
            <ListTopContentRoot>
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <ListItemSkeleton key={index} />
                ))}
            </ListTopContentRoot>
          </ListTopRoot>
        }
      >
        <div className="flex w-full flex-col gap-4">
          <UserTopItem withPagination={false} {...getConfiguration(ordering)} />
          <Button asChild className="self-center" size="lg" variant="secondary">
            <Link href={Routing.User.topDetail({ params: { tab: ordering } })}>Больше</Link>
          </Button>
        </div>
      </Suspense>
    </div>
  );
}
