export interface ThumbnailSlide {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  loading?: 'lazy' | 'eager';
  srcset?: string;
  sizes?: string;
  ariaLabel?: string;
  metadata?: Record<string, any>;
  errorFallback?: string;
  placeholder?: string;
}

export interface ImagePreviewConfig {
  loadingStrategy?: 'lazy' | 'eager';
  thumbnailSize?: {
    width: number;
    height: number;
  };
  errorHandler?: (error: Error) => void;
  onImageLoad?: (imageData: ThumbnailSlide) => void;
  defaultAlt?: string;
  defaultErrorFallback?: string;
}

export interface ImagePreviewListData {
  listId: string;
  images: ThumbnailSlide[];
  config?: ImagePreviewConfig;
}

export interface LightboxCallbacks {
  view?: (params: { index: number }) => void;
  imageDecode?: (event: Event) => void;
}
