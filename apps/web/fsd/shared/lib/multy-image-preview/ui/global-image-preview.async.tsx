'use client';
import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';

import { useImagePreviewModalStore } from '../model/image-preview-store';
import { LightboxCallbacks, ThumbnailSlide } from '../model/types';

const LighboxImplementaion = lazy(() =>
  import('~shared/lib/multy-image-preview/ui/lightbox-implementation').then((v) => ({
    default: v.LightboxImplementation,
  }))
);

export function GlobalImagePreviewAsync() {
  const { isOpen, closePreview, currentIndex, setCurrentIndex, currentImages, config } =
    useImagePreviewModalStore();

  if (!currentImages?.length) return null;
  const slides: ThumbnailSlide[] = currentImages.map((image) => ({
    src: image.src,
    alt: image.alt,
    title: image.title,
    description: image.description,
    loading: (image.loading || config?.loadingStrategy || 'lazy') as 'lazy' | 'eager',
    srcset: image.srcset,
    sizes: image.sizes,
    ariaLabel: image.ariaLabel,
    metadata: image.metadata,
    errorFallback: image.errorFallback || '/images/error-placeholder.jpg',
    placeholder: image.placeholder,
  }));

  const callbacks: LightboxCallbacks = {
    view: ({ index }) => setCurrentIndex(index),

    imageDecode: (_event) => {
      const slide = slides[currentIndex];
      if (slide) {
        config?.onImageLoad?.(slide);
      }
    },
  };

  return (
    <Suspense fallback={<DialogLoading />}>
      {isOpen && (
        <LighboxImplementaion
          slides={slides}
          index={currentIndex}
          open={isOpen}
          close={closePreview}
          on={callbacks}
        />
      )}
    </Suspense>
  );
}
