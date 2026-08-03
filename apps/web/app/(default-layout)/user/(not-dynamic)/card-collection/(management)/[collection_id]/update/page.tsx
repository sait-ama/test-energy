import { getTranslations } from 'next-intl/server';

import { EditCardCollectionFormPage } from '~pages/(user)/manage-card-collection-pages/edit/page';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata<
  NextPageParams<{
    collection_id: string;
  }>
>(
  withMetadataCache(async ({ params }) => {
    const [{ collection_id }, t] = await Promise.all([params, getTranslations()]);
    const title = t(`pages.collections-cards-edit-page.meta.title`, { collection: collection_id });
    const description = t(`pages.collections-cards-edit-page.meta.description`);

    return generateNextMetadata({
      title,
      description,
      index: false,
      follow: false,
    });
  }, 'card-collection-edit')
);

export default async function CardCollectionEditPage(_: NextPageParams<{ collection_id: string }>) {
  return (
    <NoSSR>
      <EditCardCollectionFormPage />
    </NoSSR>
  );
}
export const dynamic = 'force-dynamic';
