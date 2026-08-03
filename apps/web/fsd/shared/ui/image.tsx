'use client';

import { cn } from '@re/ui-kit/utils/cn';

import {
  MEDIA_LOADING_STATUS as IMAGE_LOADING_STATUS,
  MediaContent,
  type MediaContentElement,
  type MediaContentProps as BaseMediaContentProps,
  MediaFallback,
  MediaProvider,
  MediaRoot,
  type MediaRootElement,
  type MediaRootProps as BaseMediaRootProps,
  type PrimitiveMediaSrc,
} from './media';

/**
 * @deprecated Use MEDIA_LOADING_STATUS from './media' instead
 */
export { IMAGE_LOADING_STATUS };

/**
 * @deprecated Use PrimitiveMediaSrc from './media' instead
 */
export type PrimitiveImageSrc = PrimitiveMediaSrc;

/**
 * @deprecated Use MediaRootElement from './media' instead
 */
export type ImageRootElement = MediaRootElement;

/**
 * @deprecated Use MediaRootProps from './media' instead
 */
export interface ImageRootProps extends BaseMediaRootProps {}

/**
 * @deprecated Use MediaRoot from './media' instead
 */
const ImageRoot = MediaRoot;

interface PrimitiveBaseProps {
  blur?: boolean;
  selectable?: boolean;
}

/**
 * @deprecated Use MediaContentProps from './media' with additional props directly instead
 */
export type ImageContentProps = BaseMediaContentProps &
  PrimitiveBaseProps & {
    width?: number;
    height?: number;
  };

/**
 * @deprecated Consider using MediaContent from './media' with width/height props directly
 */
export interface ImageContentSquareProps extends Omit<ImageContentProps, 'width' | 'height'> {
  size?: number;
}

/**
 * @deprecated Use MediaContentElement from './media' instead
 */
export type ImageContentElement = MediaContentElement;

/**
 * @deprecated Use MediaContent from './media' instead, with additional className props as needed
 */
function ImageContent(props: ImageContentProps) {
  const { blur, selectable = true, className, ...rest } = props;

  // Создаем объект с нашими дополнительными стилями
  const combinedClassName = cn(
    {
      'blur-xs': !!blur,
      'select-none': !selectable,
    },
    className
  );

  return <MediaContent className={combinedClassName} draggable={selectable} {...rest} />;
}

/**
 * @deprecated Use MediaRootProps from './media' instead
 */
export type ImageProps = ImageRootProps;

/**
 * @deprecated Use MediaContent from './media' with width/height props directly
 */
function ImageSquareContent(props: ImageContentSquareProps) {
  const { size, ...rest } = props;

  return <ImageContent {...(rest as unknown as ImageContentProps)} width={size} height={size} />;
}

interface ImageFallbackProps extends React.ComponentProps<'div'> {
  delayMs?: number;
}

/**
 * @deprecated Use MediaFallback from './media' instead
 */
function ImageFallback(props: ImageFallbackProps) {
  const { className, delayMs, ...fallbackProps } = props;

  return (
    <MediaFallback
      delayMs={delayMs}
      className={cn('bg-muted/10 flex h-full w-full items-center justify-center', className)}
      {...fallbackProps}
    />
  );
}

interface ImageLoadingProps extends React.ComponentProps<'div'> {
  isLoading?: boolean;
}

/**
 * @deprecated Consider creating loading states with MediaFallback from './media'
 */
function ImageLoading(props: ImageLoadingProps) {
  const { isLoading, className, ...loadingProps } = props;

  // If isLoading is explicitly set to false, don't render
  if (isLoading === false) return null;

  return (
    <div
      {...loadingProps}
      className={cn('bg-muted absolute h-full w-full animate-pulse', className)}
    />
  );
}

/**
 * @deprecated Use MediaProvider from './media' instead
 */
const ImageProvider = MediaProvider;

export { ImageContent, ImageFallback, ImageLoading, ImageProvider, ImageRoot, ImageSquareContent };
