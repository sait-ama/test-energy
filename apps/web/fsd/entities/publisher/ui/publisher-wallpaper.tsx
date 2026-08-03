'use client';

import { cn } from '@re/ui-kit/utils/cn';

import type { WallpaperBackgroundProps, WallpaperRootProps } from '~shared/ui/wallpaper';
import { Wallpaper, WallpaperBackground, WallpaperRoot } from '~shared/ui/wallpaper';

export const PublisherWallpaperRoot = (props: WallpaperRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperRoot className={cn('h-[1px]', className)} {...rest}>
      {children}
    </WallpaperRoot>
  );
};

export const PublisherWallpaperBackground = (props: WallpaperBackgroundProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperBackground className={cn('aspect-[3/2] md:max-h-[400px]', className)} {...rest}>
      {children}
    </WallpaperBackground>
  );
};

export const PublisherWallpaper = Wallpaper;
