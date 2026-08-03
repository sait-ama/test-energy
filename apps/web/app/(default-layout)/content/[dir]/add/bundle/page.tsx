import { getTranslations } from 'next-intl/server';

import { AddBundlePage } from '~pages/(bundle)/add-bundle/ui/add-bundle-page';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.add-bundle-page.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-bundle-add')
);

export default async function EditChapters() {
  return <AddBundlePage />;
}

export const dynamic = 'force-dynamic';
