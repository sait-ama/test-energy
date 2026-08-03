import { useTranslations } from 'next-intl';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { Post } from '~entities/post/ui/post-card';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  continueEqualsNegativeProps,
  continueEqualsPositiveProps,
  useConfirmedAsyncAction,
} from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { useBan } from '../model/mutations/ban';

interface BanButtonWithConfirmationProps extends ButtonProps {
  onSettled?: () => void;
}

const BanButtonAvailable2BanPostWithConfirmation = ({
  onSettled,
  className,
  ...props
}: BanButtonWithConfirmationProps) => {
  const post = Post.useContext((v) => v.post);
  const { is_banned } = post;
  const t = useTranslations('pages.forum.actions.ban');
  const { mutateAsync } = useBan();
  const onBan = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ path: { dir: post.dir }, body: { do_ban: !post?.is_banned } });
      toast.success(t(`${is_banned ? 'undo' : 'do'}.success`));
    } catch (e: unknown) {
      logger.error(e, { scope: ['local'] });

      await resolveErrorAsync(e);
    } finally {
      onSettled?.();
    }
  };
  const banWithConfirm = useConfirmedAsyncAction(onBan, {
    title: t(is_banned ? 'undo.alert' : 'do.alert'),
    ...(post.is_deleted ? continueEqualsPositiveProps : continueEqualsNegativeProps),
  });

  return (
    <Button
      variant="ghost"
      className={cn('z-10 w-full', className)}
      {...props}
      onClick={banWithConfirm}
    >
      {t(is_banned ? 'undo.submit' : 'do.submit')}
    </Button>
  );
};
export const BanPostStateActionItem = ({
  canBan,
  className,
  ...props
}: { canBan?: boolean } & BanButtonWithConfirmationProps) => {
  const t = useTranslations('pages.forum.actions.ban');

  if (!canBan) {
    return (
      <Button
        variant="ghost"
        {...props}
        className={cn(className, 'cursor-auto hover:bg-transparent')}
      >
        {t('has_no_ability_2_interact')}
      </Button>
    );
  }
  return <BanButtonAvailable2BanPostWithConfirmation className={className} {...props} />;
};
