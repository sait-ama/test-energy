'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import HeartContained from '@re/ui-kit/icons/heart-contained';
import Report from '@re/ui-kit/icons/report';
import { Button } from '@re/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { ReportModalAsync } from '~entities/report/ui/report.async';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import {
  useCurrentUserFollowUserMutation,
  useUserFollowersOptimisticMutation,
} from '~features/author-subscribe/model/mutations';
import { ProfileActionsTrigger } from '~features/author-subscribe/ui/profile-actions-trigger';
import { DetailedUserResponseSchema } from '~shared/api/models/user';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const ProfileActions = (props: { id?: string }) => {
  const { id: routerId } = useParams() as { id: string };
  const id = routerId || props.id;
  const t = useTranslations('reusable.actions');

  const [enabled, setEnabled] = useState(false);
  const { mutateAsync } = useCurrentUserFollowUserMutation(id);
  const mutate = useUserFollowersOptimisticMutation(id!);
  const { data } = useUserSuspenseQuery(
    { variables: { params: { userId: String(id!) } } },
    { enabled }
  );

  const user = data as unknown as DetailedUserResponseSchema;
  const isSubscribed = !!user?.is_subscribed;
  const checked = useLoggedCheck();

  const handleSubscribe = checked(async () => {
    const op = isSubscribed ? 'remove' : 'add';
    const toast = await importToastAsync();
    try {
      const res = await mutateAsync({ operation: op });
      const detail = res.detail;
      if (detail?.author_users) {
        if (detail.author_users.includes(String(id))) {
          toast.error(
            `Не удалось ${isSubscribed ? 'отписаться от постов' : 'подписаться на посты'} пользователя : ${isSubscribed ? 'вы уже подписаны' : ''}`
          );
          return;
        } else {
          mutate(op);
          toast.success(
            `Подписка на посты пользователя${isSubscribed ? ' отменена' : ' добавлена'}`
          );
          return;
        }
      } else {
        mutate(op);
        toast.success(`Подписка на посты пользователя${isSubscribed ? ' отменена' : ' добавлена'}`);
      }
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return (
    <ReportModalAsync
      type="user"
      target={id!}
      fallback={
        <Button circle size="sm" variant="secondary">
          <ProfileActionsTrigger />
        </Button>
      }
    >
      {(onOpen) => (
        <Popover
          onOpenChange={(open) => {
            if (open) {
              setEnabled(true);
            }
          }}
        >
          <PopoverTrigger asChild>
            {/*@ts-ignore todo*/}
            <Button circle size="sm" variant="secondary">
              <ProfileActionsTrigger />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="cs-modal-profile-settings mt-[6px] flex w-[170px] flex-col md:mr-[20px]">
            <Button
              onClick={handleSubscribe}
              endIcon={<HeartContained className="ml-[5px]" />}
              className="flex items-center justify-between px-3 text-sm"
              size="sm"
              variant="ghost"
            >
              {!enabled ? (
                <Skeleton containerClassName="w-full" className="h-[30px] w-full" />
              ) : (
                <span>{isSubscribed ? 'Отписаться' : 'Отслеживать'}</span>
              )}
            </Button>
            <Button
              onClick={() => {
                onOpen();
              }}
              className="flex items-center justify-between px-3 text-sm"
              size="sm"
              variant="ghost"
              endIcon={<Report />}
            >
              <span>{t('report')}</span>
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </ReportModalAsync>
  );
};
