import { getTranslations } from 'next-intl/server';

import { Wordle as WordleComponent } from '~pages/(battlepass)/wordle/wordle';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.wordle-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-wordle')
);

export default function Wordle() {
  return <WordleComponent />;
}

export const dynamic = 'force-dynamic';
