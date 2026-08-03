import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary, queryOptions } from '@tanstack/react-query';

import { v2TitlesCharactersRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { v2TitlesCharactersRetrieve } from '@re/api/generated/sdk.gen';

import { CharacterPage } from '~pages/(character)/character-detail-page/ui/character-page';
import { client } from '~shared/api/client';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { fallbackEmpty as _ } from '~shared/seo/fallback-empty';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (props: { params: Promise<{ id: string }> }) => {
    const params = await props.params;
    const t = await getTranslations('pages.character-page.meta');

    const character = await v2TitlesCharactersRetrieve({
      client,
      cache: 'no-cache',
      path: { id: Number(params.id) },
    }).then((v) => v.data!);

    return generateNextMetadata({
      title: t('title', {
        characterName: character.name,
        titleName: character.titles.map((it) => it.main_name).join(', '),
      }),
      description: t('description', {
        characterName: character.name,
        description: _((character.description ?? '').replace(htmlRegExp, '')),
        altName: _(character.alt_name),
        mainName: _(character.titles.map((it) => it.main_name).join(', ')),
        secondaryName: _(character.titles.map((it) => it.secondary_name).join(', ')),
        anotherName: _(character.titles.map((it) => it.another_name).join(', ')),
        age: _(character.details.age),
        sex: _(character.details.sex),
        affiliation: _(character.details.affiliation),
        power: _(character.details.power),
        skills: _(character.details.skills),
        classification: _(character.details.classification),
      }),
      canonical: Routing.Character.main({ params: { id: params.id } }),
    });
  }, 'character-detailed')
);

export default async function Character(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      queryOptions({
        ...v2TitlesCharactersRetrieveOptions({
          path: { id: Number(params.id) },
          client,
          cache: 'force-cache',
          next: { revalidate: 60 * 60 },
        }),
        select: (v) => ({ ...v, description: sanitizeSync(v.description!) }),
      })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CharacterPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
