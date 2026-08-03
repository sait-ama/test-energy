import { ReactNode, Suspense } from 'react';
import { ScrollRestorer } from 'next-scroll-restorer';

import { DefaultFooter } from '~widgets/footer/ui/footer';
import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';

import { Profiler } from '../_profiler';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <Profiler id="layout">
      <AppLayoutRoot>
        <DefaultNavigation />
        <AppLayoutContent>
          <Profiler id="nested">{children}</Profiler>
        </AppLayoutContent>
        <DefaultFooter />
        <Suspense>
          <ScrollRestorer />
        </Suspense>
      </AppLayoutRoot>
    </Profiler>
  );
}
