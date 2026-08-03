import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Question, Quiz } from '~pages/(battlepass)/quiz/quiz';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { randInt } from '~shared/utils/rand-int';
import { shuffleArray } from '~shared/utils/shuffle';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('battlepass.quiz-game.meta');

    return generateNextMetadata({
      title: t('title'),
      description: t('description'),
      index: false,
    });
  }, 'battlepass-quiz')
);

export default async function QuizPage() {
  const session = await getSession();

  if (!session) forbidden();

  const variant = randInt(1, 19);
  const res = await fetch(UrlFormatter.media(`public/battlepass-quiz/${variant}.json`));

  if (!res.ok) {
    throw new Error('Cannot load data');
  }
  const json = await res.json();

  const questions = shuffleArray<Question>(json.questions);
  return <Quiz questions={questions} />;
}

export const dynamic = 'force-dynamic';
