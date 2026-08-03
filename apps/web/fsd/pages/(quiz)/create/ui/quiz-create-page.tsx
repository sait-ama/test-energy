'use server';

import { getTranslations } from 'next-intl/server';

import { ReText } from '@re/ui-kit/ui/text';

import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';

import { QuizCreateForm } from './quiz-create-form';

export interface QuizCreatePageProps {}

export const QuizCreatePage = async () => {
  const t = await getTranslations('quiz-create.content');

  return (
    <Container slim className="flex flex-col gap-4 px-3 py-4">
      <div className="flex w-full items-center justify-between gap-4">
        <Underline>
          <ReText size="xl" weight="semibold">
            {t('title')}
          </ReText>
        </Underline>
      </div>
      <QuizCreateForm />
    </Container>
  );
};
