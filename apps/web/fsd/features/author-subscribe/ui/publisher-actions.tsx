'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Forum from '@re/ui-kit/icons/forum';
import Leave from '@re/ui-kit/icons/leave';
import Report from '@re/ui-kit/icons/report';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import { usePublisher } from '~entities/publisher/model/hooks';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { useFollowMutationPostProcess } from '~entities/user-subscriptions/model/mutations';
import {
  useExitFromCurrentPublisher,
  usePublisherFollowMutation,
} from '~features/author-subscribe/model/mutations';
import { ProfileActionsTrigger } from '~features/author-subscribe/ui/profile-actions-trigger';
import type { SubContentType } from '~shared/api/models/user-subscriptions';
import Title from '~shared/assets/placeholders/title';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useConfirmedAsyncAction } from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const PublisherActions = ({
  publisherDir,
  publisherId,
}: {
  publisherDir?: string;
  publisherId: number;
}) => {
  const { dir: routerDir } = useParams();
  const dir = (routerDir || publisherDir)! as string;
  const [enabled, setEnabled] = useState(false);
  const { data: is_subscribed_posts = false } = usePublisher(
    dir,
    (v) => v.content?.is_subscribed_posts
  );
  const { data: is_subscribed_titles = false } = usePublisher(
    dir,
    (v) => v.content?.is_subscribed_titles
  );

  const isMember = usePublisher(dir, (v) => v.props?.is_member)?.data ?? false;
  const { mutateAsync } = useFollowMutationPostProcess({
    invalidate: PublisherQueryKey.getPublisherByDir({ params: { dir } }),
  });
  const mutate = usePublisherFollowMutation(publisherId);
  const id = publisherId;

  const { mutateAsync: exitAsync } = useExitFromCurrentPublisher();
  const t = useTranslations('publisher.actions');

  const onExit = async () => {
    try {
      const toast = await importToastAsync();
      await exitAsync();
      toast.success(t('exit.do.submit'));
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };

  const onExitConfirmed = useConfirmedAsyncAction(onExit);

  const checked = useLoggedCheck();
  const handleSubscribe = checked(async (sub_type: SubContentType) => {
    const isSubscribed =
      sub_type === 'titles_publishers'
        ? is_subscribed_titles
        : sub_type === 'author_publishers'
          ? is_subscribed_posts
          : false;
    const op = isSubscribed ? 'remove' : 'add';
    try {
      await mutateAsync({ operation: op, sub_type, id });
      mutate(op, sub_type);
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return (
    <ReportModalAsync
      type="publisher"
      target={id}
      fallback={
        <Button circle size="sm" variant="outline">
          <ProfileActionsTrigger />
        </Button>
      }
    >
      {(onOpen) => (
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) {
              setEnabled(true);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            {/*@ts-ignore todo*/}
            <Button circle size="sm" color="secondary">
              <ProfileActionsTrigger />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                handleSubscribe('author_publishers');
              }}
              className="flex items-center justify-start gap-2 pr-3 pl-1 text-sm"
            >
              {!enabled ? (
                <Skeleton containerClassName="w-full" className="h-[30px] w-full" />
              ) : (
                <>
                  <Forum className={`ml-1 ${is_subscribed_posts ? 'text-red-500' : ''}`} />
                  {t(`subscribe.posts.${is_subscribed_posts ? 'undo' : 'do'}.trigger`)}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                handleSubscribe('titles_publishers');
              }}
              className="flex items-center justify-start gap-2 pr-3 pl-1 text-sm"
            >
              {!enabled ? (
                <Skeleton containerClassName="w-full" className="h-[30px] w-full" />
              ) : (
                <>
                  <Title className={cn('ml-1 h-5 w-5', { 'text-red-500': is_subscribed_titles })} />
                  {t(`subscribe.titles.${is_subscribed_titles ? 'undo' : 'do'}.trigger`)}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onOpen();
              }}
              className="flex items-center justify-start gap-2 pr-3 pl-1 text-sm"
            >
              <Report className={cn('ml-1 h-5 w-5')} />
              <span>{t('report.title')}</span>
            </DropdownMenuItem>
            {isMember && (
              <DropdownMenuItem
                onClick={onExitConfirmed}
                className="flex items-center justify-start gap-2 pr-3 pl-1 text-sm"
              >
                <Leave className={cn('ml-1 h-5 w-5')} />
                <span>{t('exit.do.trigger')}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ReportModalAsync>
  );
};
