'use client';

import { lazy, Suspense } from 'react';

const ShopFeedItemPreviewDialog = lazy(() =>
  import(/* webpackChunkName: "ShopFeedItemPreviewDialog" */ './shop-feed-item-preview-view').then(
    (m) => ({
      default: m.ShopFeedItemPreviewView,
    })
  )
);

export const ShopFeedItemPreviewViewAsync = (props: any) => (
  <Suspense fallback="">
    <ShopFeedItemPreviewDialog {...props} />
  </Suspense>
);
