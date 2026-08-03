import { ComponentProps, ReactNode, useCallback } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import { useCreateExchangeMutation } from '~features/(collection-card)/model/mutations';
import type { ShortCardItem } from '~shared/api/generated/models';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { noop } from '~shared/utils/noop';

type DoExchangeProps = {
  collectionId: number;
  children?: ((isPending: boolean, isSuccess: boolean) => ReactNode) | ReactNode;
  onSuccess?: (card: ShortCardItem) => Promise<void>;
} & Omit<ComponentProps<'div'>, 'children'>;
export const DoExchange = ({ children, collectionId, onSuccess, ...props }: DoExchangeProps) => {
  const { mutateAsync, isPending, isSuccess } = useCreateExchangeMutation({
    path: { collection_id: collectionId },
  });
  const onExchange = useCallback(async () => {
    try {
      const [card] = await Promise.all([
        mutateAsync({
          path: { collection_id: collectionId },
          // @ts-ignore
          //todo fix swagger shema - remove body
          body: {} as unknown as ShortCardItem,
        }),
      ]);

      if (card) {
        await onSuccess?.(card);
      }
    } catch (e: unknown) {
      await resolveErrorAsync(e);
    }
  }, [collectionId, mutateAsync, onSuccess]);
  return (
    <Slot onClick={mergeFunc(onExchange, props?.onClick || noop)} {...props}>
      {typeof children === 'function' ? children(isPending, isSuccess) : children}
    </Slot>
  );
};
