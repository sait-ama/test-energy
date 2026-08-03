import React from 'react';

import Trash from '@re/ui-kit/icons/trash';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useRemoveMoment } from '~entities/title/model/mutations';
import { MomentSchema } from '~shared/api/models/inventory';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useConfirmedAsyncAction } from '~shared/lib/submit-action/use-submit-action';

export interface RemoveMomentProps extends ButtonProps {
  model: MomentSchema;
}

export const RemoveMoment = (props: RemoveMomentProps) => {
  const { className, model, ...rest } = props;
  const { mutateAsync: removeAsync, isPending: isRemoving } = useRemoveMoment();

  const handleRemove = useConfirmedAsyncAction(
    async () => {
      try {
        await removeAsync({ path: { moment_dir: model.dir! } });
      } catch (e) {
        await resolveErrorAsync(e);
      }
    },
    {
      title: 'Удалить момемент?',
      description: 'Вы уверены, что хотите удалить момент?',
      confirmVariant: 'destructive',
      closeVariant: 'secondary',
    }
  );

  return (
    <Button
      color="danger"
      className={cn('flex items-center !px-3', className)}
      startIcon={<Trash className={cn('transition-colors duration-300')} size={16} />}
      disabled={isRemoving}
      {...rest}
      onClick={handleRemove}
    >
      <ReText className="h-[21px]" size="sm">
        Удалить
      </ReText>
    </Button>
  );
};
