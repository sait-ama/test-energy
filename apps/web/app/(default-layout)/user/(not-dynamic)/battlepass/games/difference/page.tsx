import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ReText } from '@re/ui-kit/ui/text';

import SpotTheDifference, { Difference } from '~pages/(battlepass)/difference/difference';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { randInt } from '~shared/utils/rand-int';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.difference-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-difference')
);

export default async function Memory() {
  const session = await getSession();

  if (!session) forbidden();

  const variant = randInt(1, 19);

  const images = [1, 2].map((it) =>
    UrlFormatter.media(`public/battlepass-difference/images/${variant}-${it}.webp`)
  ) as [string, string];

  const res = await fetch(UrlFormatter.media(`public/battlepass-difference/data/${variant}.json`));

  if (!res.ok) {
    throw new Error('Cannot load data');
  }

  const differences = (await res.json()) as Difference[];

  return (
    <Container slim>
      <ReText size="xl" weight="semibold" className="mb-4">
        Найди отличия
      </ReText>
      <SpotTheDifference images={images} differences={differences} />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
