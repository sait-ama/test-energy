'use client';
import { createZustandContext } from '@re/core/utils/create-zustand-context';

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
