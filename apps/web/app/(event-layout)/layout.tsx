import { ReactNode, Suspense } from 'react';
import { ScrollRestorer } from 'next-scroll-restorer';

import { getPathname } from '@nimpl/getters/get-pathname';

import { DefaultFooter } from '~widgets/footer/ui/footer';
import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';

import { Profiler } from '../_profiler';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const pathname = getPathname();
  const event = pathname?.split?.('/')?.at?.(-1);
  // const currentEvent = getEvent();
  // if (event !== currentEvent) notFound();

  return (
    <Profiler id="layout">
      <AppLayoutRoot data-theme-event={event} data-override-theme="true">
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
