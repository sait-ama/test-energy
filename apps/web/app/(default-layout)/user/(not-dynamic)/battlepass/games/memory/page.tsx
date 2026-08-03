import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// import { getMinigameProgress } from '~entities/battlepass/model/queries';
import { MemoryGame } from '~pages/(battlepass)/memory/memory';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.memory-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-memory')
);

export default async function Memory() {
  const queryClient = getQueryClient();
  const session = await getSession();

  if (!session) forbidden();

  // await queryClient.prefetchQuery(
  //     getMinigameProgress({
  //         variables: {
  //             params: {
  //                 game_id: 1,
  //                 user_id: session.id,
  //             },
  //         },
  //     }),
  // );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container slim>
        <MemoryGame />
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
