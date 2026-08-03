'use client';

import type { ReactNode } from 'react';
import React, { Fragment } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { ExchangeFilters, ExchangeRoot } from '~pages/(user)/exchanges/ui/exchanges-tab';
import { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { PostQueryProvider, PostsFilters } from '~widgets/post/post-feed-subject';

enum SocialSubTab {
  COMMENTS = 'comments',
  EXCHANGES = 'exchanges',
  FRIENDS_REQUESTS = 'friends-requests',
  POSTS = 'posts',
  SUBSCRIPTIONS = 'subscriptions',
}

const getProvider = (tab: SocialSubTab) => {
  if (tab === SocialSubTab.EXCHANGES) return ExchangeRoot;
  if (tab === SocialSubTab.POSTS) return PostQueryProvider;
  return Fragment;
};

const getAction = (tab: SocialSubTab) => {
  if (tab === SocialSubTab.EXCHANGES) return ExchangeFilters;
  if (tab === SocialSubTab.POSTS) return PostsFilters;
  return Fragment;
};

const SocialTabs = ({ actions }: { actions: ReactNode }) => {
  const params = useParams();
  const tab = usePathname().split('/').at(-1)! as SocialSubTab;
  const t = useTranslations('user.tabs');
  const userId = params.id as string;
  const router = useRouter();

  const [state, setState] = useControllableState({
    prop: tab,
    onChange: (tab) => {
      router.replace(Routing.User.detail({ params: { id: userId, tab: 'social', subTab: tab } }));
    },
  });

  const { features } = useSiteConfig()!;

  const user = useSession();
  const isLogged = useLogged();
  const isCurrentUser = Number(userId) === user?.id;

  return (
    <Tabs
      activationMode="manual"
      value={state}
      onValueChange={(v) => setState(v as SocialSubTab)}
      className="flex w-full justify-between gap-2"
    >
      <ScrollArea>
        <TabsList className="cs-tabs-list">
          <TabsTrigger value="exchanges" {...TestProps.id('exchanges_tab_btn')}>
            {t('exchanges')}
          </TabsTrigger>
          {features[Features.FORUM] ? (
            <TabsTrigger value="posts" {...TestProps.id('posts_tab_btn')}>
              {t('posts')}
            </TabsTrigger>
          ) : null}
          {isLogged ? (
            <TabsTrigger value="comments" {...TestProps.id('comments_tab_btn')}>
              {t('comments')}
            </TabsTrigger>
          ) : null}
          {isCurrentUser ? (
            <TabsTrigger value="subscriptions" {...TestProps.id('following_tab_btn')}>
              {t('following')}
            </TabsTrigger>
          ) : null}
          {isCurrentUser ? (
            <TabsTrigger value="friends-requests" {...TestProps.id('friends_requests_tab_btn')}>
              {t('friends-requests')}
            </TabsTrigger>
          ) : null}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {actions}
    </Tabs>
  );
};

interface SocialLayoutProps {
  children: React.ReactNode;
}

export const SocialLayout = (props: SocialLayoutProps) => {
  const { children } = props;
  const pathname = usePathname()!;

  const tab = pathname.split('/').at(-1)! as SocialSubTab;
  const Provider = getProvider(tab);
  const Actions = getAction(tab);

  return (
    <Provider>
      <div className="flex flex-col gap-2">
        <SocialTabs actions={<Actions />} />
        {children}
      </div>
    </Provider>
  );
};
