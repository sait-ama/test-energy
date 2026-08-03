'use client';
import { create } from 'zustand';

import { ImagePreviewConfig, ThumbnailSlide } from './types';

interface ImagePreviewModalStore {
  isOpen: boolean;
  currentIndex: number;
  currentImages: ThumbnailSlide[];
  config?: ImagePreviewConfig;
  openPreview: (images: ThumbnailSlide[], startIndex?: number, config?: ImagePreviewConfig) => void;
  closePreview: () => void;
  setCurrentIndex: (index: number) => void;
}

export const useImagePreviewModalStore = create<ImagePreviewModalStore>((set) => ({
  isOpen: false,
  currentIndex: 0,
  currentImages: [],
  config: undefined,
  openPreview: (images, startIndex = 0, config) => {
    const normalizedIndex = startIndex === -1 ? images.length - 1 : startIndex;
    set({
      isOpen: true,
      currentImages: images,
      currentIndex: normalizedIndex,
      config,
    });
  },
  closePreview: () => set({ isOpen: false }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
}));

// global
export const imagePreview = {
  /**
   *
   * @param src
   * @param options
   */
  open: (
    src: string,
    options?: Partial<Omit<ThumbnailSlide, 'src'>> & { config?: ImagePreviewConfig }
  ) => {
    const image: ThumbnailSlide = {
      src,
      alt: options?.alt || options?.config?.defaultAlt || '',
      ...options,
    };
    useImagePreviewModalStore.getState().openPreview([image], 0, options?.config);
  },

  /**
   * open list
   * @param images
   * @param options
   */
  openList: (
    images: (string | ThumbnailSlide)[],
    options?: {
      index?: number;
      config?: ImagePreviewConfig;
    }
  ) => {
    const normalizedImages = images.map((item): ThumbnailSlide => {
      if (typeof item === 'string') {
        return {
          src: item,
          alt: options?.config?.defaultAlt || '',
        };
      }
      return {
        ...item,
        alt: item.alt || options?.config?.defaultAlt || '',
      };
    });

    useImagePreviewModalStore
      .getState()
      .openPreview(normalizedImages, options?.index ?? 0, options?.config);
  },

  close: () => {
    useImagePreviewModalStore.getState().closePreview();
  },
};
