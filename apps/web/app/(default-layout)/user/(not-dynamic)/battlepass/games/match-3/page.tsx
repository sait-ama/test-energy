import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Match3 } from '~pages/(battlepass)/match-3/match-3';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.match3-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-match3')
);

export default async function MatchGame() {
  const session = await getSession();

  if (!session) forbidden();

  return (
    <Container slim className="flex min-h-screen items-center justify-center">
      <NoSSR>
        <Match3 />
      </NoSSR>
    </Container>
  );
}
export const dynamic = 'force-dynamic';
