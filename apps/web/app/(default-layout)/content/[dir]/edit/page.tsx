import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import {
  getTitleAdditionalKey,
  getTitleDetailKey,
  getTitleRelationsKey,
} from '~entities/title/model/queries';
import { titleFormsTypes } from '~features/title-form/model/const';
import { FormsTypes } from '~shared/api/models/forms';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { EditTitleFormsPage } from '~widgets/edit-title-form/ui/edit-title-forms-page';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const t = await getTranslations(`pages.edit-title-page.meta.${siteConfig.contentType}`);
    const title = await queryClient.fetchQuery(
      getTitleDetailKey({
        variables: { params: { dir: params.dir } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    return generateNextMetadata({
      title: t('title', { main_name: title.main_name }),
      description: t('description', { siteName: siteConfig.site.name, main_name: title.main_name }),
      index: false,
      follow: false,
    });
  }, 'title-edit')
);

export default async function EditChapterRootPage(props: NextPageParams<{ dir: string }>) {
  const session = getSession();

  const params = await props.params;

  if (!session) forbidden();

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(
      getTypesBaseKey({
        get: titleFormsTypes,
        type: FormsTypes.TITLES,
      })
    ),
    queryClient.prefetchQuery(getTitleDetailKey({ variables: { params: { dir: params.dir } } })),
    queryClient.prefetchQuery(
      getTitleAdditionalKey({ variables: { params: { dir: params.dir } } })
    ),
    queryClient.prefetchQuery(getTitleRelationsKey({ variables: { params: { dir: params.dir } } })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditTitleFormsPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
