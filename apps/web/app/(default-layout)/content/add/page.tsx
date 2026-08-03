import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { titleFormsTypes } from '~features/title-form/model/const';
import { FormsTypes } from '~shared/api/models/forms';
import { getQueryClient } from '~shared/api/react-query';
import { getContentType, getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { AddTitleForm } from '~widgets/add-title-form/ui/add-title-form';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const contentType = getContentType();

    const siteConfig = getSiteConfig()!;

    const t = await getTranslations(`pages.add-title-page.meta.${contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-add')
);

export default async function AddTitlePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    getTypesBaseKey({
      get: titleFormsTypes,
      type: FormsTypes.TITLES,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddTitleForm />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
