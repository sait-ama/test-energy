import { getTranslations } from 'next-intl/server';

import { AddCustomization } from '~pages/(customization)/add-customization-page/ui/add-customization';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.customization-add-page.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'customization-add')
);

export default function AddCustomizationPage() {
  return <AddCustomization />;
}

export const dynamic = 'force-dynamic';
