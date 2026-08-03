'use client';
import { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';

import { usePostActions } from '~entities/post/model/ability/post/ability';
import { Post } from '~entities/post/ui/post-card';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { BanPostStateActionItem } from '~features/(post)/manage-post-status/ui/ban-button-with-confirmation';
import { DeleteButtonWithConfirmation } from '~features/(post)/manage-post-status/ui/delete-button-with-confirmation';
import { PinButtonWithConfirmation } from '~features/(post)/manage-post-status/ui/pin-button-with-confirmation';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { SytheticEventPreventer } from '~shared/utils/prevent-default';

const CopyDropDownItem = memo(() => {
  const dir = Post.useContext((v) => v.post?.dir);
  const t = useTranslations('reusable.actions');

  const handleCopy = useCallback(async () => {
    try {
      const toast = await importToastAsync();
      const url = new URL(window.location.href);

      url.pathname = Routing.Forum.ByDir.get({
        params: { dir },
      });

      await window.navigator.clipboard.writeText(url.toString());
      toast.success(t('copy-link-success'));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  }, [dir]);

  return (
    <DropdownMenuItem
      className="text-left"
      withDialog
      onClick={handleCopy}
      {...TestProps.id('post-actions-copy-link')}
    >
      {t('copy-link')}
    </DropdownMenuItem>
  );
});

export interface PostActionsProps extends ButtonProps {}

export const PostActionsTrigger = memo(({ className, ...props }: PostActionsProps) => {
  const post = Post.useContext((v) => v.post);
  const { write: canUpdatePost, ban: canBan, remove: canDel, pin: canPin } = usePostActions();
  const [open, setOpen] = useState(false);
  const t = useTranslations('reusable.actions');

  const close = () => setOpen(false);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          className={className}
          circle
          variant="ghost"
          {...props}
          {...TestProps.id('post-actions-trigger')}
        >
          <DotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="mr-10 flex flex-col"
        onClick={new SytheticEventPreventer().default().process}
      >
        <CopyDropDownItem />
        <ReportModalAsync target={post.id} type="post">
          <DropdownMenuItem
            className="text-left"
            withDialog
            {...TestProps.id('post-actions-report')}
          >
            {t('report')}
          </DropdownMenuItem>
        </ReportModalAsync>
        {canUpdatePost && (
          <DropdownMenuItem withDialog className="text-left">
            <Link
              prefetch={false}
              href={Routing.Forum.ByDir.edit({
                params: { dir: post.dir },
                query: {
                  title: post.title?.dir,
                  publisher: post.publisher?.dir,
                  tags: post.tags.map((v) => v.id),
                },
              })}
              {...TestProps.id('post-actions-edit')}
            >
              {t('edit-reduction')}
            </Link>
          </DropdownMenuItem>
        )}
        {canBan && (
          <DropdownMenuItem
            asChild
            className="!justify-start"
            {...TestProps.id('post-actions-ban')}
          >
            <BanPostStateActionItem canBan={canBan} onSettled={close} />
          </DropdownMenuItem>
        )}
        {canDel && (
          <DropdownMenuItem
            asChild
            withDialog
            className="!justify-start"
            {...TestProps.id('post-actions-delete')}
          >
            <DeleteButtonWithConfirmation onSettled={close} />
          </DropdownMenuItem>
        )}
        {canPin && (
          <DropdownMenuItem
            asChild
            withDialog
            className="!justify-start"
            {...TestProps.id('post-actions-pin')}
          >
            <PinButtonWithConfirmation onSettled={close} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
