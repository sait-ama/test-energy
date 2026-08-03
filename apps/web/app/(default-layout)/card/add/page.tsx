import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { CardAddPageRoot } from '~pages/card-add/ui/card-add-page';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { parseJson } from '~shared/utils/parse-json';
import type { CardAddFormProps } from '~widgets/card-add-form/ui/card-add-form';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.hero-card-add.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'card-add')
);

export default async function CreateCard(props: NextPageParams<{}, { defaultValues?: string }>) {
  const searchParams = await props.searchParams;
  const defaultValues =
    parseJson<CardAddFormProps['defaultValues']>(searchParams.defaultValues ?? '') || undefined;

  return (
    <Suspense>
      <CardAddPageRoot defaultValues={defaultValues} key={searchParams.defaultValues} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
