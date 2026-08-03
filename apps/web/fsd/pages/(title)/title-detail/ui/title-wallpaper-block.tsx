import {
  TitleWallpaper,
  TitleWallpaperBackground,
  TitleWallpaperRoot,
} from '~entities/title/ui/title-wallpaper';

import { getCurrentPageTitleDetail } from '../model/server';

type TitleWallpaperBlockProps = {
  dirPromise: Promise<string>;
};

export const TitleWallpaperBlock = async ({ dirPromise }: TitleWallpaperBlockProps) => {
  const dir = await dirPromise;
  const data = await getCurrentPageTitleDetail(dir);

  const wallpaper = data.wallpaper?.high;
  const wallpaperFallback = data.cover.high;
  const wallpaperResolved = wallpaper || wallpaperFallback;

  return (
    <TitleWallpaperRoot>
      <TitleWallpaperBackground className="z-[-1]">
        <TitleWallpaper src={wallpaperResolved} withBlur={!wallpaper} />
      </TitleWallpaperBackground>
    </TitleWallpaperRoot>
  );
};
