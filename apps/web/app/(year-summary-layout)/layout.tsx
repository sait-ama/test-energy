import React, { ReactNode, Suspense } from 'react';
import { ScrollRestorer } from 'next-scroll-restorer';

import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AppLayoutRoot>
      <DefaultNavigation />
      <AppLayoutContent>{children}</AppLayoutContent>
      <Suspense>
        <ScrollRestorer />
      </Suspense>
    </AppLayoutRoot>
  );
}
