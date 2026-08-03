import type { ReactNode } from 'react';

import { Wallpaper, WallpaperBackground, WallpaperRoot } from '~shared/ui/wallpaper';
import { UrlFormatter } from '~shared/utils/url-formatter';

const fallback = undefined;

export const CustomizationWallpaper = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <WallpaperRoot className={className}>
    <WallpaperBackground className="max-via-1000 bg-secondary pointer-events-none aspect-[2/1] h-[250px] overflow-hidden rounded-sm">
      <Wallpaper
        className="pointer-events-none"
        src={UrlFormatter.media('public/shop/wallpaper.webp')}
        fallback={fallback}
      />
    </WallpaperBackground>
    {children}
  </WallpaperRoot>
);
