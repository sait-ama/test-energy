import { useTranslations } from 'next-intl';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { Post } from '~entities/post/ui/post-card';
import { useRemovePostAction } from '~features/(post)/manage-post-status/model/mutations/delete';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  continueEqualsNegativeProps,
  continueEqualsPositiveProps,
  useConfirmedAsyncAction,
} from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface DeleteButtonWithConfirmationProps extends ButtonProps {
  onSettled?: () => void;
}

export const DeleteButtonWithConfirmation = ({
  onSettled,
  className,
  ...props
}: DeleteButtonWithConfirmationProps) => {
  const post = Post.useContext((v) => v.post);
  const { mutateAsync } = useRemovePostAction();
  const t = useTranslations('pages.forum.actions.delete');
  const toggleDelete = async () => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ body: { is_deleted: !post?.is_deleted }, path: { dir: post.dir } });
      toast.success(t(`${post.is_deleted ? 'undo' : 'do'}.success`));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    } finally {
      onSettled?.();
    }
  };
  const pinWithConfirmation = useConfirmedAsyncAction(toggleDelete, {
    ...(post.is_deleted ? continueEqualsPositiveProps : continueEqualsNegativeProps),
    title: t(`${post.is_deleted ? 'undo' : 'do'}.alert`),
  });

  return (
    <Button
      variant="ghost"
      className={cn('z-10 w-full', className)}
      {...props}
      onClick={pinWithConfirmation}
    >
      {t(`${post.is_deleted ? 'undo' : 'do'}.submit`)}
    </Button>
  );
};
