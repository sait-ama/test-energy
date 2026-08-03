'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import Sticky from 'react-sticky-el';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useInfiniteNotificationsList } from '~entities/notification/model/queries';
import {
  NotificationStoreProvider,
  useNotificationsStatus,
} from '~entities/notification/model/store';
import { AllNotificationsDropdown } from '~features/notifications-actions/ui/all-notifications-dropdown';
import { DeleteNotificationsButton } from '~features/notifications-actions/ui/delete-notifications-button';
import { ReadNotificationsButton } from '~features/notifications-actions/ui/read-notifications-button';
import { Routing } from '~shared/config/routing';
import { useControllableState } from '~shared/hooks/use-controllable-state';
import { Container } from '~shared/ui/container';

interface NotificationsTabsProps {
  children: ReactNode;
}

export const NotificationsTabs = (props: NotificationsTabsProps) => {
  const { children } = props;
  const params = useParams();
  const t = useTranslations('notifications');

  const tab = usePathname().split('/').at(-1)!;

  const { value, setValue } = useNotificationsStatus();

  const { data } = useInfiniteNotificationsList({
    variables: { query: { status: value, type: params.dir } },
  });

  const getNotificationsCount = (notifType: string): number => {
    if (value === '1') {
      return data?.pages
        ?.map((it) => it.props.notification_types)
        .flatMap((it) => it)
        .filter((it) => it.name === notifType)
        .map((it) => it.count - it.unread)[0] as number;
    }

    return (
      // @ts-ignore
      data?.pages
        ?.map((it) => it.props.notification_types)
        .flatMap((it) => it)
        .find((it) => it.name === notifType).unread ?? 0
    );
  };

  const [state, setState] = useControllableState({
    prop: tab,
    onChange: (tab) => {
      router.replace(
        Routing.User.notifications({
          params: {
            tab,
          },
          query: { status: value },
        })
      );
    },
  });

  const router = useRouter();

  return (
    <Container slim className="px-2">
      <div className="bg-background/95 z-10 flex flex-col gap-4 rounded-b-sm py-2">
        <ReText size="xl" component="h2" weight="semibold">
          Уведомления
        </ReText>

        <Tabs
          activationMode="manual"
          value={state}
          onValueChange={setState}
          className="flex flex-col gap-4"
        >
          <div className={cn('flex flex-col gap-2 md:flex-row md:justify-between')}>
            <Sticky wrapperClassName="bg-background" topOffset={-8} stickyClassName="z-100 py-2">
              <ScrollArea>
                <TabsList>
                  <TabsTrigger value="0">
                    {t('tabs.updates', {
                      count: getNotificationsCount('Обновление'),
                    })}
                  </TabsTrigger>
                  <TabsTrigger value="1">
                    {t('tabs.social', {
                      count: getNotificationsCount('Социальное'),
                    })}
                  </TabsTrigger>
                  <TabsTrigger value="2">
                    {t('tabs.important', {
                      count: getNotificationsCount('Важное'),
                    })}
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Sticky>

            <div className="flex justify-between gap-2">
              <Select value={String(value)} onValueChange={setValue}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('statuses.new')}</SelectItem>
                  <SelectItem value="1">{t('statuses.read')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="bg-card border-border flex items-center gap-2 rounded-md border px-2">
                {value !== '1' ? <ReadNotificationsButton /> : null}
                <DeleteNotificationsButton />
                <AllNotificationsDropdown />
              </div>
            </div>
          </div>
        </Tabs>
      </div>
      {children}
    </Container>
  );
};

export const NotificationTabsRoot = ({ children }: PropsWithChildren) => (
  <NotificationStoreProvider>
    <NotificationsTabs>{children}</NotificationsTabs>
  </NotificationStoreProvider>
);
