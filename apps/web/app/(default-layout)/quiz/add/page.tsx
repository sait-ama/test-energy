import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { QuizCreatePage } from '~pages/(quiz)/create/ui/quiz-create-page';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('quiz-create.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
      follow: false,
    });
  }, 'quiz-create')
);

export default async function CardListPage(_: NextPageParams<{ id: string }, never>) {
  const queryClient = getQueryClient();
  const session = await getSession();

  if (!session) unauthorized();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizCreatePage />
    </HydrationBoundary>
  );
}
