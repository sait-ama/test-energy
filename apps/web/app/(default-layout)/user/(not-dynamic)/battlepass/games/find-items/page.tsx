import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ReText } from '@re/ui-kit/ui/text';

import FindItems, { ItemSchema } from '~pages/(battlepass)/find-items/find-items';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { randInt } from '~shared/utils/rand-int';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.find-items-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'find-items-game')
);

export default async function FindItemsPage() {
  const session = await getSession();

  if (!session) forbidden();

  const variant = randInt(1, 19);

  const image = UrlFormatter.media(`public/battlepass-find-items/images/${variant}.webp`);

  const res = await fetch(UrlFormatter.media(`public/battlepass-find-items/data/${variant}.json`));

  if (!res.ok) {
    throw new Error('Cannot load data');
  }

  const items = (await res.json()) as ItemSchema[];

  return (
    <Container slim>
      <ReText size="xl" weight="semibold" className="mt-4 mb-4">
        Найди предметы
      </ReText>
      <FindItems image={image} items={items} />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
