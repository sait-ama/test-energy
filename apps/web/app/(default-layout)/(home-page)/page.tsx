import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { SectionVisibilityContextProvider } from '~features/page-section-visibility/ui/section-visibility';
import {
  CollectionSlider,
  ColumnSlider,
  ContinueReadingSlider,
  CustomSliders,
  GeneralSlider,
  HotNewSlider,
  LastUpdatesList,
  PromobannersSlider,
  PromotionSlider,
} from '~pages/home/ui/home';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { OnlyLogged } from '~shared/lib/auth/only-logged';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

import { Profiler } from '../../_profiler';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations();
    const domainConfig = getSiteConfig()!;

    const title = t(`pages.home.meta.${domainConfig.contentType}.title`);

    const description = t(`pages.home.meta.${domainConfig.contentType}.description`, {
      siteName: domainConfig.site.name,
    });

    return generateNextMetadata({
      title,
      description,
      keywords: t(`pages.home.meta.${domainConfig.contentType}.keywords`),
      canonical: Routing.Home.main({}),
    });
  }, 'home')
);

export default async function Home() {
  return (
    <SectionVisibilityContextProvider className="mt-4 space-y-8 md:space-y-12 xl:space-y-12">
      <Profiler id="general-slider">
        <GeneralSlider />
      </Profiler>
      <Profiler id="how-new-slider">
        <HotNewSlider />
      </Profiler>

      <Profiler id="continue-slider">
        <OnlyLogged>
          <Suspense fallback={null}>
            <ContinueReadingSlider />
          </Suspense>
        </OnlyLogged>
      </Profiler>

      <Profiler id="promobanners-slider">
        <PromobannersSlider />
      </Profiler>

      <Profiler id="column-slider">
        <ColumnSlider />
      </Profiler>

      <Profiler id="collection-slider">
        <CollectionSlider />
      </Profiler>

      <Profiler id="promotion-slider">
        <PromotionSlider />
      </Profiler>

      <Profiler id="custom-sliders">
        <CustomSliders />
      </Profiler>

      <Profiler id="last-updates-slider">
        <LastUpdatesList />
      </Profiler>
    </SectionVisibilityContextProvider>
  );
}
