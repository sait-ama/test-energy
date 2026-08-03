'use client';

import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { cn } from '@re/ui-kit/utils/cn';

import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { useTourItem } from '~shared/lib/tour/items';

export const RootTabs = ({ className }: { className?: string }) => {
  const params = useParams<{ id: string }>();
  const tab = useSelectedLayoutSegment() || 'about';
  const t = useTranslations('user.tabs');
  const userId = params.id;
  const router = useRouter();

  const [state, setState] = useControllableState({
    prop: tab,
    onChange: (tab) => {
      router.replace(Routing.User.detail({ params: { id: userId, tab } }));
    },
  });

  const user = useSession();
  const isLogged = !!user;
  const isCurrentUser = Number(userId) === user?.id;
  const userInventoryTourProps = useTourItem('user-inventory-tab');

  return (
    <Tabs
      activationMode="manual"
      value={state}
      onValueChange={setState}
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <ScrollArea>
        <TabsList size="md" className="max-sm:pl-4">
          <TabsTrigger value="about" {...TestProps.id('profile_tab_btn')}>
            {t('profile')}
          </TabsTrigger>
          {isLogged ? (
            <TabsTrigger value="bookmarks" {...TestProps.id('bookmarks_tab_btn')}>
              {t('bookmarks')}
            </TabsTrigger>
          ) : null}

          {isCurrentUser && user.can_buy_premium_type ? (
            <TabsTrigger
              value="subscription"
              {...TestProps.id('subscription_tab_btn')}
              className="group flex gap-2"
            >
              {t('subscription')}
              <span className="group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-primary bg-primary text-primary-foreground vertical-align-middle flex h-4 items-center justify-center rounded-md px-2 pb-1 text-xs">
                pro
              </span>
            </TabsTrigger>
          ) : null}
          <TabsTrigger
            value="inventory"
            {...userInventoryTourProps}
            {...TestProps.id('inventory_tab_btn')}
          >
            {t('inventory')}
          </TabsTrigger>
          <TabsTrigger
            value="social"
            {...userInventoryTourProps}
            {...TestProps.id('social_tab_btn')}
          >
            {t('social')}
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
};
