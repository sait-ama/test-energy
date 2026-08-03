import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { EventHalloweenPromoPage } from '~pages/(events)/halloween/ui/promo';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { appendSitename } from '~shared/seo/append-sitename';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (_) => {
    const t = await getTranslations('halloween.meta');
    const title = appendSitename(t('title'));
    return generateNextMetadata({
      title,
      description: t('description'),
    });
  }, 'halloween-promo')
);
interface HalloweenPageProps extends NextPageParams {}
const HalloweenPage: FC<HalloweenPageProps> = async () => {
  return (
    <NoSSR>
      <EventHalloweenPromoPage key="halloween-promo" />
    </NoSSR>
  );
};
export default HalloweenPage;
