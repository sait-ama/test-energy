import { getTranslations } from 'next-intl/server';

import { TitleBundlesListRoot } from '~pages/(title)/edit-title-bundles/title-bundles-list';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;

    const t = await getTranslations(`pages.edit-bundle-page.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-bundles-edit')
);

export default async function BundlesEdit() {
  return <TitleBundlesListRoot />;
}

export const dynamic = 'force-dynamic';
