import { getTranslations } from 'next-intl/server';

import { CreateCardCollectionFormPage } from '~pages/(user)/manage-card-collection-pages/create/page';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations();
    const title = t(`pages.collections-cards-add-page.meta.title`);

    const description = t(`pages.collections-cards-add-page.meta.description`);

    return generateNextMetadata({
      title,
      description,
      index: false,
      follow: false,
    });
  }, 'card-collection-add')
);

export default async function CardCollectionAddPage() {
  return (
    <NoSSR>
      <CreateCardCollectionFormPage />
    </NoSSR>
  );
}
export const dynamic = 'force-dynamic';
