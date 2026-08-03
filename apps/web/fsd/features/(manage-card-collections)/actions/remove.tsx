import { ComponentProps } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useRemoveCollection } from '~features/(manage-card-collections)/actions/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface RemoveCollectionCardsProps extends ComponentProps<'div'> {
  collectionId: number;
  userId: number;
  onError?: () => void;
  onSuccess?: (toast: Awaited<ReturnType<typeof importToastAsync>>) => void;
}

export const RemoveCollectionCards = ({
  collectionId,
  userId,
  children,
  onSuccess,
  onError,
  ...props
}: RemoveCollectionCardsProps) => {
  const { mutateAsync, isPending } = useRemoveCollection({ collectionId, userId });
  const handleSubmit = async () => {
    try {
      const [toast] = await Promise.all([
        importToastAsync(),
        mutateAsync({
          path: {
            collection_id: Number(collectionId),
          },
        }),
      ]);
      onSuccess?.(toast);
    } catch (err) {
      await resolveErrorAsync(err);
      onError?.();
    }
  };
  return (
    // @ts-expect-error
    <Slot disabled={isPending} onClick={handleSubmit} {...props}>
      {children}
    </Slot>
  );
};
