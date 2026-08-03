'use client';
import { ReactNode } from 'react';

import Like from '@re/ui-kit/icons/like';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useLikeMoment } from '~entities/inventory/model/mutations';
import { MomentSchema } from '~shared/api/models/inventory';
import { LikeDislikeType, RatedStatus } from '~shared/api/models/post';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { SytheticEventPreventer } from '~shared/utils/prevent-default';

export interface LikeMomentProps extends Omit<ButtonProps, 'children'> {
  model: MomentSchema;
  onSuccess?: () => Promise<void>;
  children: ((score: number) => ReactNode) | ReactNode;
}

export const LikeMoment = (props: LikeMomentProps) => {
  const { model, children, onSuccess, ...rest } = props;
  const { mutateAsync, isPending: isPendingLike } = useLikeMoment();

  const checkLogged = useLoggedCheck();

  const handleToggleLike = checkLogged(async () => {
    try {
      await mutateAsync({ body: { moment: model.id, type: LikeDislikeType.LIKE } });
      await onSuccess?.();
    } catch (e) {
      await resolveErrorAsync(e);
    }
  });
  return (
    <Button
      size="sm"
      color="secondary"
      {...rest}
      onClick={(e) => {
        new SytheticEventPreventer().default().process(e);
        handleToggleLike();
      }}
      disabled={isPendingLike}
      startIcon={
        <Like
          className={cn(
            { 'fill-current text-red-700': model?.rated === RatedStatus.LIKED },
            'transition-colors duration-300'
          )}
        />
      }
    >
      {typeof children === 'function' ? children(model?.score ?? 0) : (model?.score ?? 0)}
    </Button>
  );
};
