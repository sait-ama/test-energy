import React from 'react';
import { useTranslations } from 'next-intl';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { Post } from '~entities/post/ui/post-card';
import { useUpdatePost } from '~features/(post)/manage-post-status/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  continueEqualsNegativeProps,
  continueEqualsPositiveProps,
  useConfirmedAsyncAction,
} from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface PinButtonWithConfirmationProps extends ButtonProps {
  onSettled?: () => void;
}

export const PinButtonWithConfirmation = ({
  onSettled,
  ...props
}: PinButtonWithConfirmationProps) => {
  const post = Post.useContext((v) => v.post);
  const { is_pinned } = post;
  const t = useTranslations('pages.forum.actions.pin');

  const { mutateAsync } = useUpdatePost();

  const onPin = async () => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ body: { is_pinned: !is_pinned }, path: { dir: post.dir } });
      toast.success(t(`${is_pinned ? 'undo' : 'do'}.success`));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    } finally {
      onSettled?.();
    }
  };
  const pinWithConfirmation = useConfirmedAsyncAction(onPin, {
    title: t(`${is_pinned ? 'undo' : 'do'}.alert`),
    ...(!post.is_pinned ? continueEqualsPositiveProps : continueEqualsNegativeProps),
  });

  return (
    <Button variant="ghost" {...props} onClick={pinWithConfirmation}>
      {t(`${is_pinned ? 'undo' : 'do'}.submit`)}
    </Button>
  );
};
