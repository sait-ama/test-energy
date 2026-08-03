'use client';
import { ComponentProps, useCallback } from 'react';

import { createZustandContext } from '@re/core/utils/create-zustand-context';
import { Slot } from '@re/ui-kit/ui/slot';

import { ShopItemSchema } from '~shared/api/models/shop';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { noop } from '~shared/utils/noop';

import { createShopFeedItemPreviewStore, ShopFeedItemPreviewStateStore } from './store';

const {
  Provider: ShopFeedItemPreviewProvider,
  useStore: useShopFeedItemPreview,
  useStoreApi: useShopFeedItemPreviewApi,
} = createZustandContext<ShopFeedItemPreviewStateStore>(
  createShopFeedItemPreviewStore,
  'ShopFeedItemPreview'
);

export { ShopFeedItemPreviewProvider, useShopFeedItemPreview, useShopFeedItemPreviewApi };
export const ShopCardItemPreviewTrigger = ({
  onClick,
  model,
  children,
  ...props
}: ComponentProps<'div'> & { model: ShopItemSchema }) => {
  const check = useLoggedCheck();

  const item = useShopFeedItemPreview((v) => v.item);
  const open = useShopFeedItemPreview((v) => v.openPreview);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openCard = useCallback(
    check(() => {
      open(item || model);
    }),
    [model, open, check, item]
  );
  return (
    <Slot onClick={mergeFunc(openCard, onClick || noop)} {...props}>
      {children}
    </Slot>
  );
};
