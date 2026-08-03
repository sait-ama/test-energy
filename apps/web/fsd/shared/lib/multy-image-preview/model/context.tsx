'use client';
import { createContext } from '@re/core/utils/create-context';

import { useImagePreviewModalStore } from '~shared/lib/multy-image-preview/model/image-preview-store';
import { ImagePreviewListData } from '~shared/lib/multy-image-preview/model/types';

export const {
  useStore: useImagePreviewListActionsStore,
  Provider: ImagePreviewListDataActionsProvider,
  Consumer: ImagePreviewListDataActionsConsumer,
} = createContext<{ triggerPreview: (src: string) => void }, ImagePreviewListData>(
  ({ images, config }) => {
    const openPreview = useImagePreviewModalStore((v) => v.openPreview);
    const indexedImages = images.reduce(
      (acc, cur, index) => {
        acc[cur.src] = index;
        return acc;
      },
      {} as Record<string, number>
    );

    const triggerPreview = (src: string) => {
      const index = indexedImages?.[src] ?? -1;
      if (index !== -1) {
        const enhancedImages = images.map((image) => ({
          ...image,
          alt: image.alt || config?.defaultAlt || '',
          errorFallback: image.errorFallback || config?.defaultErrorFallback,
        }));
        openPreview(enhancedImages, index, config);
      }
    };

    return {
      triggerPreview,
    };
  }
);
