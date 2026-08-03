'use client';

import { cn } from '@re/ui-kit/utils/cn';

import type {
  WallpaperBackgroundProps,
  WallpaperProps,
  WallpaperRootProps,
} from '~shared/ui/wallpaper';
import { Wallpaper, WallpaperBackground, WallpaperRoot } from '~shared/ui/wallpaper';

export const UserWallpaperRoot = (props: WallpaperRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperRoot className={cn('h-[1px]', className)} {...rest}>
      {children}
    </WallpaperRoot>
  );
};

export const UserWallpaperBackground = (props: WallpaperBackgroundProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperBackground className={cn('h-[250px] md:h-[420px]', className)} {...rest}>
      {children}
    </WallpaperBackground>
  );
};

export type UserWallpaperProps = WallpaperProps;

export const UserWallpaper = (props: UserWallpaperProps) => {
  const { className, ...rest } = props;

  return (
    <Wallpaper
      className={cn('sm:mask-point-via-[30%] object-top md:object-cover', className)}
      {...rest}
    />
  );
};
