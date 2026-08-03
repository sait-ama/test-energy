import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

// import { getMinigameProgress } from '~entities/battlepass/model/queries';
import { GRID_SIZE } from '~entities/games/model/const';
import { PuzzleGame } from '~pages/(battlepass)/puzzle/puzzle';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
// import { getQueryClient } from '~shared/api/react-query';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { randInt } from '~shared/utils/rand-int';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.puzzle-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-puzzle')
);

export default async function PuzzleGamePage() {
  // const queryClient = getQueryClient();
  const session = await getSession();

  if (!session) forbidden();

  // const progress = await queryClient.fetchQuery(getMinigameProgress({ variables: { params: { user_id: session.id, game_id: 2 } } }));

  const basePath = UrlFormatter.media(`public/battlepass-puzzle/${randInt(1, 10)}`);

  const imageSet = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1).reduce<
    Record<number, string>
  >((acc, it) => {
    acc[it] = `${basePath}/${it}.webp`;
    return acc;
  }, {});

  return (
    <Container slim className="px-2">
      <PuzzleGame imageSet={imageSet} />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
