'use client';

import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

import { cn } from '@re/ui-kit/utils/cn';

import { MEDIA_LOADING_STATUS, MediaContent, MediaProvider } from '~shared/ui/media';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface WallpaperRootProps extends ComponentPropsWithoutRef<'div'> {}

export const WallpaperRoot = (props: WallpaperRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={cn('relative w-full select-none', className)} {...rest}>
      {children}
    </div>
  );
};

export interface WallpaperBackgroundProps extends ComponentPropsWithoutRef<'div'> {}

export const WallpaperBackground = (props: WallpaperBackgroundProps) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn('absolute top-0 right-0 left-0 z-[-1] w-full overflow-hidden', className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export interface WallpaperProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  fallback?: string | ReactNode;
  isFullUrl?: boolean;
  src: string | StaticImport | undefined;
  className?: string;
  withMask?: boolean;
  validatePath?: boolean;
  withBlur?: boolean;
}

export const Wallpaper = (props: WallpaperProps) => {
  const {
    src,
    fallback,
    withMask = false,
    withBlur = false,
    validatePath = true,
    alt = 'Обои',
    className,
  } = props;
  const [imageLoadingStatus, setImageLoadingStatus] = useState<MEDIA_LOADING_STATUS>(
    MEDIA_LOADING_STATUS.LOADED
  );

  const classes = cn(
    'object-cover',
    withMask && 'mask-linear mask-via-15 dark:mask-via-30 sm:mask-via-15  sm:mask-point-via-[90%]',
    className
  );

  if (!src && !!fallback)
    return (
      <div className={cn('flex h-full w-full items-center justify-center', classes)}>
        {fallback}
      </div>
    );

  const resolvedSrc = src || (fallback as string | undefined);

  if (!resolvedSrc) return null;

  return (
    <MediaProvider
      value={{
        onStatusChange: setImageLoadingStatus,
        status: imageLoadingStatus,
        src:
          typeof resolvedSrc === 'object' || !validatePath
            ? resolvedSrc
            : UrlFormatter.media(resolvedSrc),
      }}
    >
      <MediaContent
        priority
        fill
        alt={alt}
        draggable={false}
        withHover={false}
        className={cn(classes, {
          'blur-[6px] sm:blur-[10px]': !src || withBlur,
          'size-full': typeof src === 'string' && src?.endsWith('.webm'),
        })}
      />
    </MediaProvider>
  );
};
