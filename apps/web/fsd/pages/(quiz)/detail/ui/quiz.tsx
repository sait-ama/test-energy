'use client';

import { useParams } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import { v2QuizzesRetrieve2Options } from '~shared/api/generated/tanstack';
import { Quiz as QuizWidget } from '~widgets/quiz/ui/quiz';

export const Quiz = () => {
  const { id } = useParams<{ id: string }>();

  const { data: quiz } = useSuspenseQuery(
    v2QuizzesRetrieve2Options({ client, path: { quiz_id: id } })
  );

  return <QuizWidget model={quiz} />;
};
