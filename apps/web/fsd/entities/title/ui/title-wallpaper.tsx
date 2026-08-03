import { cn } from '@re/ui-kit/utils/cn';

import type {
  WallpaperBackgroundProps,
  WallpaperProps,
  WallpaperRootProps,
} from '~shared/ui/wallpaper';
import { Wallpaper, WallpaperBackground, WallpaperRoot } from '~shared/ui/wallpaper';

export type TitleWallpaperRootProps = WallpaperRootProps;

export const TitleWallpaperRoot = (props: TitleWallpaperRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperRoot className={cn('h-[1px]', className)} {...rest}>
      {children}
    </WallpaperRoot>
  );
};

export type TitleWallpaperBackgroundProps = WallpaperBackgroundProps;

export const TitleWallpaperBackground = (props: TitleWallpaperBackgroundProps) => {
  const { children, className, ...rest } = props;

  return (
    <WallpaperBackground className={cn('h-[60vh] md:max-h-[600px]', className)} {...rest}>
      {children}
    </WallpaperBackground>
  );
};

export type TitleWallpaperProps = WallpaperProps;

export const TitleWallpaper = (props: TitleWallpaperProps) => {
  const { className, ...rest } = props;

  return (
    <Wallpaper
      withMask
      className={cn('sm:mask-from-30 sm:mask-point-via-[30%] sm:opacity-70', className)}
      {...rest}
    />
  );
};
