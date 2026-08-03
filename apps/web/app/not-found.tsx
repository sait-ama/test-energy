import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ScrollRestorer } from 'next-scroll-restorer';

import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { DefaultFooter } from '~widgets/footer/ui/footer';
import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';

export const generateMetadata = async () => {
  const t = await getTranslations('pages.not-found.meta');

  return generateNextMetadata({
    title: t('title'),
    description: t('description'),
    index: false,
    follow: false,
  });
};

export default function NotFound() {
  return (
    <AppLayoutRoot>
      <DefaultNavigation />
      <AppLayoutContent>
        <div className="flex min-h-screen w-full items-center justify-center"></div>
      </AppLayoutContent>
      <DefaultFooter />
      <Suspense>
        <ScrollRestorer />
      </Suspense>
    </AppLayoutRoot>
  );
}

export const dynamic = 'force-dynamic';
