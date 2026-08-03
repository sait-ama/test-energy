import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getCharacterKey } from '~entities/character/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { EditCharacterForm } from '~widgets/edit-character/ui/edit-character-form';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;

    const t = await getTranslations('pages.character-edit-page.meta');
    const queryClient = getQueryClient();
    const siteConfig = getSiteConfig()!;

    const character = await queryClient.fetchQuery(
      getCharacterKey({
        variables: { params: { characterId: id } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    return generateNextMetadata({
      title: t('title', {
        characterName: character.name,
        titleName: character?.titles[0]?.main_name ?? '',
      }),
      description: t('description', {
        siteName: siteConfig.site.name,
        characterName: character.name,
      }),
      index: false,
      follow: false,
    });
  }, 'character-edit')
);

export default async function Edit(props: NextPageParams<{ id: string }>) {
  const queryClient = getQueryClient();
  const params = await props.params;

  const { id } = params;

  await queryClient.prefetchQuery(getCharacterKey({ variables: { params: { characterId: id } } }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditCharacterForm />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
