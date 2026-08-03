import { PropsWithChildren, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ScrollRestorer } from 'next-scroll-restorer';

import { Features } from '~shared/config/feature-flags';
import { getSiteConfig } from '~shared/config/site-config';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { AppLayoutContent, AppLayoutRoot } from '~widgets/layout/ui/app-layout';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';
import { BottomBarMobile } from '~widgets/navigation/ui/navigation.mobile';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations();
    const domainConfig = getSiteConfig()!;

    const title = t(`pages.chat.meta.title`);

    const description = t(`pages.chat.meta.description`, {
      siteName: domainConfig.site.name,
    });

    return generateNextMetadata({
      title,
      description,
      keywords: t(`pages.chat.meta.keywords`),
    });
  }, 'chat')
);

export default async ({ children }: PropsWithChildren) => {
  const siteConfig = getSiteConfig()!;

  if (!siteConfig.features[Features.CHAT]) notFound();

  return (
    <AppLayoutRoot className="max-h-[100dvh] overflow-hidden">
      <DefaultNavigation HeaderMobile={null} />
      <AppLayoutContent withPaddingTop={false} fullheight className="max-h-[100dvh] min-h-[100dvh]">
        {children}
        <Media lessThan={Display.md}>
          <BottomBarMobile className="relative z-0 block md:hidden" />
        </Media>
      </AppLayoutContent>
      <Suspense>
        <ScrollRestorer />
      </Suspense>
    </AppLayoutRoot>
  );
};
