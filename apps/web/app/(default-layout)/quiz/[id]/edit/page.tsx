import { forbidden, notFound, unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { QuizEditPage } from '~pages/(quiz)/edit/ui/quiz-edit-page';
import { client } from '~shared/api/client';
import { QuizDetail } from '~shared/api/generated/models';
import { v2QuizzesRetrieve2Options } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('quiz-edit.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
      follow: false,
    });
  }, 'quiz-edit')
);

export default async function NextQuizEditPage(props: NextPageParams<{ id: string }, never>) {
  const queryClient = getQueryClient();
  const session = await getSession();

  if (!session) unauthorized();

  const params = await props.params;
  const quizId = params.id;

  const quiz = (await queryClient.fetchQuery(
    v2QuizzesRetrieve2Options({ client, path: { quiz_id: quizId } })
  )) as QuizDetail;

  if (!quiz) notFound();

  if (quiz.quiz.author.id != session.id) forbidden();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuizEditPage id={quizId} />
    </HydrationBoundary>
  );
}
