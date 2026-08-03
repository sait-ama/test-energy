import { notFound, unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { QuizDetailPage } from '~pages/(quiz)/detail/ui/quiz-detail-page';
import { client } from '~shared/api/client';
import { v2QuizzesRetrieve2Options } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (props: NextPageParams<{ id: string }, never>) => {
    const { id } = await props.params;
    const t = await getTranslations('quiz-detail.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      canonical: Routing.Quiz.detail({ params: { id } }),
    });
  }, 'quiz-detail')
);

export default async function CardListPage(props: NextPageParams<{ id: string }, never>) {
  const [{ id: quiz_id }, session] = await Promise.all([props.params, getSession()]);
  const queryClient = getQueryClient();
  if (!session) unauthorized();

  const quizId = quiz_id;

  const quiz = await queryClient.fetchQuery(
    v2QuizzesRetrieve2Options({ client, path: { quiz_id: quizId } })
  );

  if (!quiz) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizDetailPage />
    </HydrationBoundary>
  );
}
