'use client';

import React, { CSSProperties, memo, ReactNode } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarSizes,
  type AvatarSizeType,
  sizeVariantToPixels,
} from '@re/ui-kit/ui/avatar';
import { MediaContent, MediaRoot } from '@re/ui-kit/ui/media';
import { cn } from '@re/ui-kit/utils/cn';

import { TestProps } from '~shared/lib/test/utils/test-props';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface UserAvatarProps {
  avatarSrc?: string | null;
  frameSrc?: string | null;
  size?: AvatarSizeType | number;
  alt: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  withHover?: boolean;
  withFrameMargin?: boolean;
  bottomSlot?: ReactNode;
  frameClassName?: string;
  topSlot?: ReactNode;
  children?: ReactNode;
  withAvatarFallback?: boolean;
}

export const UserAvatar = memo((props: UserAvatarProps) => {
  const {
    className,
    withAvatarFallback = true,
    bottomSlot,
    topSlot,
    imgClassName,
    withHover,
    withFrameMargin = true,
    size,
    avatarSrc,
    frameSrc,
    alt,
    style,
    frameClassName,
    children,
    ...rest
  } = props;

  const shape = !frameSrc ? 'square' : 'square';

  const pixelSize =
    typeof size === 'number'
      ? size
      : typeof size === 'string'
        ? sizeVariantToPixels[size as AvatarSizes]
        : undefined;

  const showFrame = withFrameMargin && frameSrc;

  const margin = withFrameMargin ? (pixelSize ? { margin: pixelSize / 8 } : undefined) : undefined;

  const combinedStyle = {
    ...margin,
    ...style,
  };

  return (
    <Avatar
      src={UrlFormatter.media(avatarSrc)}
      className={cn(
        {
          'outline-border relative select-none': !showFrame,
          'overflow-visible': showFrame,
          group: withHover,
        },
        className
      )}
      {...TestProps.id(`profile_icon`)}
      size={size}
      shape={shape}
      style={combinedStyle}
    >
      {topSlot}
      {children || (
        <>
          <AvatarImage draggable={false} alt={alt} className={imgClassName} {...rest} />
          {withAvatarFallback && <AvatarFallback>{alt}</AvatarFallback>}
          {frameSrc && (
            <MediaRoot
              src={UrlFormatter.media(frameSrc)}
              className={cn('absolute top-0 left-0 z-[2] scale-125 select-none', frameClassName)}
            >
              <MediaContent alt="Рамка" />
            </MediaRoot>
          )}
        </>
      )}
      {bottomSlot}
    </Avatar>
  );
});
