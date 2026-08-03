import { getTranslations } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { AddCollection } from '~widgets/collections-form/ui/add-collection';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.collections.collection-add');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('meta.title'),
      description: t('meta.description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'collection-add')
);

export default async function AddCollectionFormPage() {
  return <AddCollection />;
}

export const dynamic = 'force-dynamic';
