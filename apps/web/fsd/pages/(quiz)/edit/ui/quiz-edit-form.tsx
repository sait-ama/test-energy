'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSuspenseQuery } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import { v2QuizzesRetrieve2Options } from '~shared/api/generated/tanstack';
import { QuizEditProvider, QuizProvider } from '~widgets/quiz-form/model/store';
import { deserializeFormValues } from '~widgets/quiz-form/model/utils';
import {
  QuizFormDateEndField,
  QuizFormDescriptionField,
  QuizFormRoot,
  QuizFormSubmitButton,
  QuizFormTitleField,
} from '~widgets/quiz-form/ui/quiz-form';
import {
  QuizFormQuestionList,
  QuizFormQuestionListAddButton,
} from '~widgets/quiz-form/ui/quiz-question';

export const QuizEditForm = () => {
  const { id } = useParams<{ id: string }>();

  const tReusable = useTranslations('reusable');
  const tQuiz = useTranslations('quiz');

  const { data: quizData } = useSuspenseQuery(
    v2QuizzesRetrieve2Options({ client, path: { quiz_id: id } })
  );

  const defaultValues = deserializeFormValues(quizData.quiz);

  return (
    <QuizFormRoot defaultValues={defaultValues}>
      <QuizProvider>
        <QuizEditProvider id={id}>
          <div className="flex flex-col gap-4">
            <QuizFormTitleField />
            <QuizFormDescriptionField />
            <QuizFormQuestionList />
            <div className="flex items-center justify-between gap-2">
              <QuizFormDateEndField />

              <div className="flex gap-2 self-end">
                <QuizFormQuestionListAddButton color="secondary">
                  {tQuiz('add-question')}
                </QuizFormQuestionListAddButton>
                <QuizFormSubmitButton>{tReusable('actions.submit')}</QuizFormSubmitButton>
              </div>
            </div>
          </div>
        </QuizEditProvider>
      </QuizProvider>
    </QuizFormRoot>
  );
};
