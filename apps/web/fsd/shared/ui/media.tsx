'use client';

import * as MediaPrimitive from '@re/ui-kit/ui/media';

import { UrlFormatter } from '~shared/utils/url-formatter';

export {
  // type MediaContentElement,
  // type MediaFallbackElement,
  // type MediaRootElement,
  MEDIA_LOADING_STATUS,
  type MediaFallbackProps,
  type NativeImageContentProps,
  type OptimizedImageContentProps,
  type PrimitiveMediaSrc,
  type PrimitiveNativeImageProps,
  type PrimitiveOptimizedImageProps,
  type PrimitiveVideoProps,
  useMediaContext,
  type VideoContentProps,
} from '@re/ui-kit/ui/media';

export interface MediaRootProps extends Omit<MediaPrimitive.MediaRootProps, 'src'> {
  src: MediaPrimitive.PrimitiveMediaSrc;
}

export type MediaContentProps = MediaPrimitive.MediaContentProps;

function MediaRoot(props: MediaRootProps) {
  const { src: originalSrc, ...rest } = props;
  const formattedSrc = UrlFormatter.media(originalSrc);

  return <MediaPrimitive.MediaRoot src={formattedSrc} {...rest} />;
}

function MediaContent(props: MediaContentProps) {
  const { src: originalSrc, ...rest } = props;
  const formattedSrc = originalSrc ? UrlFormatter.media(originalSrc) : originalSrc;

  return <MediaPrimitive.MediaContent src={formattedSrc} {...rest} />;
}

function MediaOptimizedImage(props: MediaPrimitive.OptimizedImageContentProps) {
  const { src: originalSrc, ...rest } = props;
  const formattedSrc = originalSrc ? UrlFormatter.media(originalSrc) : originalSrc;

  return <MediaPrimitive.MediaOptimizedImage src={formattedSrc} {...rest} />;
}

function MediaNativeImage(props: MediaPrimitive.NativeImageContentProps) {
  const { src: originalSrc, ...rest } = props;
  const formattedSrc = originalSrc ? UrlFormatter.media(originalSrc) : originalSrc;

  return <MediaPrimitive.MediaNativeImage src={formattedSrc} {...rest} />;
}

function MediaVideo(props: MediaPrimitive.VideoContentProps) {
  const { src: originalSrc, ...rest } = props;
  const formattedSrc = originalSrc ? UrlFormatter.media(originalSrc) : originalSrc;

  return <MediaPrimitive.MediaVideo src={formattedSrc} {...rest} />;
}

const MediaFallback = MediaPrimitive.MediaFallback;
const MediaProvider = MediaPrimitive.MediaProvider;

const Root = MediaRoot;
const Content = MediaContent;
const Fallback = MediaFallback;
const Provider = MediaProvider;

export {
  Content,
  Fallback,
  MediaContent,
  MediaFallback,
  MediaNativeImage,
  MediaOptimizedImage,
  MediaProvider,
  MediaRoot,
  MediaVideo,
  Provider,
  Root,
};
