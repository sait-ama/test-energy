'use client';
import { memo, ReactEventHandler, RefAttributes, useRef, useState } from 'react';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import type { ImageProps as NextImageProps } from 'next/image';
import NextImage from 'next/image';

import { useCallbackRef } from '@re/core/hooks/use-callback-ref';
import { useLayoutEffect } from '@re/core/hooks/use-layout-effect';
import { createContext } from '@re/core/utils/create-context';

import { cn } from '../utils/cn';

import type { VideoProps } from './video';
import { Video } from './video';

export enum MEDIA_LOADING_STATUS {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

export type PrimitiveMediaSrc = string | undefined | null;

interface MediaContext {
  status: MEDIA_LOADING_STATUS;
  onStatusChange: (status: MEDIA_LOADING_STATUS) => void;
  src?: PrimitiveMediaSrc;
  alt?: string;
}

const { Provider: MediaProvider, useStore: useMedia } = createContext<MediaContext, MediaContext>(
  (v) => v,
  'MediaStore'
);

export interface MediaRootProps extends React.ComponentProps<'span'> {
  src?: PrimitiveMediaSrc;
  alt?: string;
  // IMPORTANT it can cause unexpected behaviour
  __dangerouslyDefaultStatus?: MEDIA_LOADING_STATUS;
}

const isFiniteStatus = (status: MEDIA_LOADING_STATUS): boolean => {
  return (
    status === MEDIA_LOADING_STATUS.IDLE ||
    status === MEDIA_LOADING_STATUS.LOADED ||
    status === MEDIA_LOADING_STATUS.ERROR
  );
};

const resolveLoadingStatus = (src: PrimitiveMediaSrc): MEDIA_LOADING_STATUS => {
  if (typeof src === 'string') {
    if (!src) return MEDIA_LOADING_STATUS.ERROR;

    return MEDIA_LOADING_STATUS.LOADED;
  }

  return MEDIA_LOADING_STATUS.IDLE;
};

const MediaRoot = memo((props: MediaRootProps) => {
  const { className, src, __dangerouslyDefaultStatus, alt, ...rest } = props;
  const [mediaLoadingStatus, setMediaLoadingStatus] = useState<MEDIA_LOADING_STATUS>(
    __dangerouslyDefaultStatus || resolveLoadingStatus(src)
  );

  return (
    <MediaProvider
      value={{ onStatusChange: setMediaLoadingStatus, alt, status: mediaLoadingStatus, src }}
    >
      <span {...rest} className={cn('relative inline-flex shrink-0', className)} />
    </MediaProvider>
  );
});

export type PrimitiveVideoElement = HTMLVideoElement;
export type PrimitiveImageElement = HTMLImageElement;

export type PrimitiveOptimizedImageProps = Omit<NextImageProps, 'src' | 'alt'>;
export type PrimitiveNativeImageProps = Omit<React.ComponentProps<'img'>, 'src' | 'alt'> & {
  fill?: boolean;
};
export type PrimitiveVideoProps = Omit<VideoProps, 'src'> & {
  fill?: boolean;
};

export interface BaseMediaContentProps {
  className?: string;
  style?: React.CSSProperties;
  alt: string;
  src?: PrimitiveMediaSrc;
  onStatusChange?: (status: MEDIA_LOADING_STATUS) => void;
  withEnterAnimation?: boolean;
}

export type OptimizedImageContentProps = Omit<BaseMediaContentProps, 'src'> &
  PrimitiveOptimizedImageProps & {
    src?: PrimitiveMediaSrc | StaticImport;
  };
export type NativeImageContentProps = BaseMediaContentProps & PrimitiveNativeImageProps;
export type VideoContentProps = BaseMediaContentProps & PrimitiveVideoProps;

export type MediaContentProps = Omit<
  OptimizedImageContentProps | NativeImageContentProps | VideoContentProps,
  'src'
> & {
  src?: PrimitiveMediaSrc | StaticImport;
  priority?: boolean;
};

enum MEDIA_ELEMENT_STRATEGY {
  OPTIMIZED_IMAGE,
  NATIVE_IMAGE,
  WEBM,
}

const defineStrategy = (
  src: PrimitiveMediaSrc,
  props?: Record<string, any>
): MEDIA_ELEMENT_STRATEGY => {
  if (typeof src === 'string') {
    if (src.endsWith('webm')) return MEDIA_ELEMENT_STRATEGY.WEBM;
  }

  const hasNextImageProps =
    props &&
    ('priority' in props ||
      'quality' in props ||
      'sizes' in props ||
      'placeholder' in props ||
      'blurDataURL' in props);

  if (hasNextImageProps) {
    return MEDIA_ELEMENT_STRATEGY.OPTIMIZED_IMAGE;
  }

  return MEDIA_ELEMENT_STRATEGY.NATIVE_IMAGE;
};

function useMediaContentStyles(
  baseClassName?: string,
  _isLoaded?: boolean,
  additionalClassNames?: Record<string, boolean>,
  withEnterAnimation?: boolean
) {
  return cn(
    baseClassName,
    withEnterAnimation && 'transition-opacity duration-600 opacity-0',
    withEnterAnimation && { 'opacity-100': _isLoaded },
    additionalClassNames
  );
}

function useMediaBase(
  providedSrc?: PrimitiveMediaSrc,
  providedOnStatusChange?: (status: MEDIA_LOADING_STATUS) => void,
  displayName = 'useMediaBase'
) {
  const {
    src: contextSrc,
    status: contextStatus,
    onStatusChange: contextOnStatusChange,
  } = useMedia(displayName);

  const isFirstRender = useRef(true);
  const prevStatusChangeData = useRef<{
    statusFor: string | null | undefined;
    status: MEDIA_LOADING_STATUS;
  }>(null);
  const src = providedSrc ?? contextSrc;

  const loadingStatus = contextStatus;

  const handleStatusChange = useCallbackRef(
    (status: MEDIA_LOADING_STATUS, statusFor: string | null | undefined) => {
      if (
        prevStatusChangeData.current &&
        prevStatusChangeData.current.statusFor === src &&
        isFiniteStatus(prevStatusChangeData.current.status)
      )
        return;

      prevStatusChangeData.current = {
        statusFor,
        status,
      };

      contextOnStatusChange?.(status);
      providedOnStatusChange?.(status);
    }
  );

  useLayoutEffect(() => {
    if (contextStatus !== MEDIA_LOADING_STATUS.IDLE) {
      providedOnStatusChange?.(contextStatus);
    }
  }, [contextStatus, providedOnStatusChange]);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isFirstRender.current) {
      handleStatusChange(src ? MEDIA_LOADING_STATUS.LOADING : MEDIA_LOADING_STATUS.IDLE, src);
    }
  }, [src]);

  return {
    src,
    loadingStatus,
    handleStatusChange,
  };
}

function useMediaHandlers<T extends Element>(
  onLoad?: ReactEventHandler<T>,
  onError?: ReactEventHandler<T>,
  onStatusChange?: (status: MEDIA_LOADING_STATUS, statusFor?: string | null) => void,
  statusFor?: string | null
) {
  const handleLoad = useCallbackRef<ReactEventHandler<T>>((event) => {
    onLoad?.(event);
    onStatusChange?.(MEDIA_LOADING_STATUS.LOADED, statusFor);
  });

  const handleError = useCallbackRef<ReactEventHandler<T>>((event) => {
    onError?.(event);
    onStatusChange?.(MEDIA_LOADING_STATUS.ERROR, statusFor);
  });

  return { handleLoad, handleError };
}

function MediaOptimizedImage(
  props: OptimizedImageContentProps & RefAttributes<PrimitiveImageElement | null>
) {
  const {
    className,
    style,
    src: propsSrc,
    alt,
    onLoad,
    onError,
    priority,
    loading = 'lazy',
    onStatusChange: propsOnStatusChange,
    withEnterAnimation,
    ...restProps
  } = props;

  const { src, loadingStatus, handleStatusChange } = useMediaBase(
    propsSrc,
    propsOnStatusChange,
    'MediaOptimizedImage'
  );

  const { handleLoad, handleError } = useMediaHandlers<PrimitiveImageElement>(
    onLoad,
    onError,
    handleStatusChange,
    src
  );

  if (!src || loadingStatus === MEDIA_LOADING_STATUS.ERROR) return null;

  const isLoaded = loadingStatus === MEDIA_LOADING_STATUS.LOADED;
  const contentClassName = useMediaContentStyles(
    className,
    isLoaded,
    undefined,
    withEnterAnimation
  );

  return (
    <NextImage
      src={src}
      alt={alt}
      className={contentClassName}
      style={style}
      loading={priority ? undefined : loading}
      priority={priority}
      onLoad={handleLoad}
      onError={handleError}
      {...restProps}
    />
  );
}

function MediaNativeImage(
  props: NativeImageContentProps & RefAttributes<PrimitiveImageElement | null>
) {
  const {
    className,
    style,
    src: propsSrc,
    alt,
    onLoad,
    onError,
    loading = 'lazy',
    onStatusChange: propsOnStatusChange,
    width,
    height,
    fill,
    withEnterAnimation,
    ...restProps
  } = props;

  const { src, loadingStatus, handleStatusChange } = useMediaBase(
    propsSrc,
    propsOnStatusChange,
    'MediaNativeImage'
  );

  const { handleLoad, handleError } = useMediaHandlers<PrimitiveImageElement>(
    onLoad,
    onError,
    handleStatusChange
  );

  if (!src || loadingStatus === MEDIA_LOADING_STATUS.ERROR) return null;

  const isLoaded = loadingStatus === MEDIA_LOADING_STATUS.LOADED;
  const contentClassName = useMediaContentStyles(
    cn(fill && 'absolute inset-0 h-full w-full object-cover', className),
    isLoaded,
    undefined,
    withEnterAnimation
  );

  return (
    <img
      src={src}
      alt={alt}
      className={contentClassName}
      loading={loading}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      {...(width !== undefined && { width })}
      {...(height !== undefined && { height })}
      {...restProps}
    />
  );
}

const MediaVideo = memo(
  (props: VideoContentProps & RefAttributes<PrimitiveVideoElement | null>) => {
    const {
      className,
      style,
      src: propsSrc,
      alt,
      ref: forwardedRef,
      onLoad,
      fill,
      onError,
      onStatusChange: propsOnStatusChange,
      loop = true,
      autoPlay = true,
      muted = true,
      playsInline = true,
      controls = false,
      withEnterAnimation,
      ...restProps
    } = props;

    const { src, loadingStatus, handleStatusChange } = useMediaBase(
      propsSrc,
      propsOnStatusChange,
      'MediaVideo'
    );

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const setVideoRef = useCallbackRef((node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else {
          forwardedRef.current = node;
        }
      }
    });

    const { handleLoad, handleError } = useMediaHandlers<PrimitiveVideoElement>(
      onLoad,
      onError,
      handleStatusChange,
      src
    );

    if (!src || loadingStatus === MEDIA_LOADING_STATUS.ERROR) return null;

    const isLoaded = loadingStatus === MEDIA_LOADING_STATUS.LOADED;
    const contentClassName = useMediaContentStyles(
      cn(fill && 'absolute inset-0 h-full w-full object-cover', className),
      isLoaded
    );

    return (
      <Video
        ref={setVideoRef}
        src={src}
        className={contentClassName}
        style={style}
        playsInline={playsInline}
        muted={muted}
        autoPlay={autoPlay}
        loop={loop}
        controls={controls}
        type="video/webm"
        onLoadedData={handleLoad}
        onError={handleError}
        {...restProps}
      />
    );
  }
);

function MediaContent(props: MediaContentProps) {
  const {
    src: propsSrc,
    onStatusChange,
    alt: propsAlt,
    className,
    style,
    // @ts-expect-error - Убираем проброшенные ранее свойство если имеется
    withHover,
    ...restProps
  } = props;

  const { src: contextSrc, alt: contextAlt } = useMedia('MediaContent');
  const src = propsSrc ?? contextSrc;
  const alt = propsAlt ?? contextAlt;

  const strategy = defineStrategy(src, restProps);

  const commonProps = {
    src,
    alt,
    className,
    style,
    onStatusChange,
  };

  switch (strategy) {
    case MEDIA_ELEMENT_STRATEGY.OPTIMIZED_IMAGE:
      return (
        <MediaOptimizedImage {...commonProps} {...(restProps as PrimitiveOptimizedImageProps)} />
      );
    case MEDIA_ELEMENT_STRATEGY.WEBM:
      return <MediaVideo {...commonProps} {...(restProps as PrimitiveVideoProps)} />;
    case MEDIA_ELEMENT_STRATEGY.NATIVE_IMAGE:
    default:
      return <MediaNativeImage {...commonProps} {...(restProps as PrimitiveNativeImageProps)} />;
  }
}

export interface MediaFallbackProps extends React.ComponentProps<'div'> {
  delayMs?: number;
}

function MediaFallback(props: MediaFallbackProps) {
  const { delayMs, className, ...fallbackProps } = props;
  const loadingStatus = useMedia((v) => v.status, 'useMediaFallback');
  return loadingStatus !== MEDIA_LOADING_STATUS.LOADED ? (
    <div
      {...fallbackProps}
      className={cn('bg-muted/10 absolute size-full items-center justify-center', className)}
    />
  ) : null;
}

const Root = MediaRoot;
const Content = MediaContent;
const Fallback = MediaFallback;
const Provider = MediaProvider;

const useMediaContext = useMedia;

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
  useMediaContext,
};
