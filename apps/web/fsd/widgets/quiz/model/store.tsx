import { createContext, ReactNode, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { z } from 'zod';

import { client } from '~shared/api/client';
import { QuizAnswer, QuizDetail, QuizQuestion } from '~shared/api/generated/models';
import { v2QuizzesQuestionsAnswersCreate } from '~shared/api/generated/repositories';
import { QUIZ_QUESTION_TYPE } from '~shared/api/models/quiz';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { QuizFormSchema } from './schema';

interface QuizContextSchema {
  model: QuizDetail;
  config: {
    size: 'md' | 'lg';
  };
  actions: {
    handleSubmit: () => void;
  };
  formDisabled: boolean;
}

export const QuizContext = createContext<QuizContextSchema | null>(null);

interface QuizProviderProps {
  children: ReactNode;
  model: QuizDetail;
  disabled?: boolean;
  config?: {
    size?: 'md' | 'lg';
  };
}

export const QuizProvider = ({ children, model, config: _config, disabled }: QuizProviderProps) => {
  const tQuiz = useTranslations('quiz');

  const config = {
    size: _config?.size ?? 'lg',
  };

  const router = useRouter();

  const form = useFormContext<QuizFormSchema>();
  const { handleSubmit: handleSubmitForm, getValues, setError, clearErrors } = form;

  const hasEnded = useMemo(
    () => (model.quiz.end_at == null ? false : Date.now() > +new Date(model.quiz.end_at)),
    [model]
  );

  const formDisabled = disabled || hasEnded;

  const resolveErrors = useErrorHandler({ form });

  const handleSubmit = useMemo(
    () => (e?: React.BaseSyntheticEvent) => {
      clearErrors();

      const handler = handleSubmitForm(
        async () => {
          const values = getValues();

          let isValid = true;

          const answers = Object.entries(values.answers)
            .map(([idString, answerItem]) => {
              const id = Number(idString.replace(/^id_/, ''));
              const answer = answerItem.answer;

              return {
                id,
                answer: Array.isArray(answer) ? answer.filter((it) => it != null) : answer,
              };
            })
            .filter((it) => !model.answers.find((answer) => answer.question_id === it.id));

          model.quiz.questions.forEach((question) => {
            const answer = answers.find((it) => it.id == question.id);

            if (!answer) return;

            if (
              question.type === QUIZ_QUESTION_TYPE.TEXT &&
              !z.string().min(1).safeParse(answer.answer).success
            ) {
              setError(`answers.id_${question.id}`, { message: 'Обязательное поле' });
              isValid = false;
            }

            if (
              question.type === QUIZ_QUESTION_TYPE.SCORE &&
              !z.number().safeParse(answer.answer).success
            ) {
              setError(`answers.id_${question.id}`, { message: 'Не выбрана ни одна из опций' });
              isValid = false;
            }

            if (
              question.type === QUIZ_QUESTION_TYPE.SINGLE &&
              !z.number().safeParse(answer.answer).success
            ) {
              setError(`answers.id_${question.id}`, { message: 'Не выбрана ни одна из опций' });
              isValid = false;
            }
          });

          if (!isValid) return;

          const toast = await importToastAsync();

          try {
            for (const item of answers) {
              await v2QuizzesQuestionsAnswersCreate({
                client,
                path: {
                  question_id: item.id,
                  quiz_id: model.quiz.id,
                },
                body: {
                  answer: item.answer,
                },
              });
            }

            toast.success(tQuiz('messages.answer-success'));
            router.refresh();
          } catch (e) {
            logger.error(e);
            resolveErrors(e);
          }
        },
        (e) => logger.error(e, { scope: ['local'] })
      );
      return handler(e);
    },
    []
  );

  const context = {
    model,
    actions: {
      handleSubmit,
    },
    config,
    formDisabled,
  };

  return <QuizContext.Provider value={context}>{children}</QuizContext.Provider>;
};

interface QuizItemContextSchema {
  question: QuizQuestion;
  answer?: QuizAnswer;
}

export const QuizItemContext = createContext<QuizItemContextSchema | null>(null);

interface QuizItemProviderProps {
  children: ReactNode;
  question: QuizQuestion;
  answer?: QuizAnswer;
}

export const QuizItemProvider = ({ children, question, answer }: QuizItemProviderProps) => {
  const context: QuizItemContextSchema = {
    question,
    answer,
  };

  return <QuizItemContext.Provider value={context}>{children}</QuizItemContext.Provider>;
};
