import type { ReactNode } from 'react';

import { Description } from '~pages/(customization)/feed-customization-page/ui/descriptioon';
import { RootTabs } from '~pages/(customization)/feed-customization-page/ui/root-tabs';
import { CustomizationWallpaper } from '~pages/(customization)/feed-customization-page/ui/wallpaper';
import { ScrollToTop } from '~shared/lib/react/scroll-to-top';
import { Container } from '~shared/ui/container';

export default async function Layout({ children }: { children: ReactNode; modal: ReactNode }) {
  return (
    <Container slim className="mt-1 flex min-h-[100dvh] flex-col gap-4 md:mt-8">
      <CustomizationWallpaper className="relative h-[250px]">
        <Description className="absolute bottom-0 z-50 flex w-full max-w-[454px] flex-col p-5" />
      </CustomizationWallpaper>
      <RootTabs className="flex flex-col gap-2" />
      {children}
      <ScrollToTop />
    </Container>
  );
}
