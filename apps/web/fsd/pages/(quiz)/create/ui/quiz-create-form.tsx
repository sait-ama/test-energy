'use client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Routing } from '~shared/config/routing';
import { QuizCreateProvider, QuizProvider } from '~widgets/quiz-form/model/store';
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

export const QuizCreateForm = () => {
  const tReusable = useTranslations('reusable');
  const tQuiz = useTranslations('quiz');
  const router = useRouter();
  return (
    <QuizFormRoot>
      <QuizProvider>
        <QuizCreateProvider
          onSuccess={(data) => {
            router.push(Routing.Quiz.detail({ params: { id: data.id } }));
          }}
        >
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
        </QuizCreateProvider>
      </QuizProvider>
    </QuizFormRoot>
  );
};
