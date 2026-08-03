import omit from 'lodash.omit';
import { nanoid } from 'nanoid';

import { Quiz, QuizRequest } from '~shared/api/generated/models';
import { QuizQuestionType } from '~shared/api/models/quiz';
import { objectOptional } from '~shared/utils/object-optional';

import { QuizFormSchema } from './schema';

export const createEmptyQuestionOption = (
  isDefault = false
): NonNullable<QuizFormSchema['questions'][number]['options']>[number] => ({
  id: isDefault ? 'f' : nanoid(2), // first is const for ssr
  value: '',
  is_correct: false,
});

export const createEmptyQuestion = (
  type: QuizQuestionType = QuizQuestionType.SINGLE,
  isDefault = false
) => {
  const question: QuizFormSchema['questions'][number] = {
    id: isDefault ? 'f' : nanoid(3), // first is const for ssr
    type,
    question: '',
    description: '',
  };

  if (type === QuizQuestionType.MULTI || type === QuizQuestionType.SINGLE) {
    question.options = [createEmptyQuestionOption(isDefault)];
  }

  return question;
};

export const serializeFormValues = (values: QuizFormSchema): QuizRequest => {
  const result = {
    ...values,
    questions: values.questions.map((question, index) => ({
      index,
      ...omit(question, 'id'),
      ...objectOptional(!!question.options, {
        options: question.options?.map((option, index) => ({
          index,
          ...omit(option, 'id'),
        })),
      }),
    })),
  };

  return result;
};

export const deserializeFormValues = (values: Quiz): QuizFormSchema => {
  const result = {
    ...values,
    questions: values.questions.map((question, index) => ({
      ...omit(question, 'index'),
      id: `index-${index}`,
      ...objectOptional(!!question.options, {
        options: question.options?.map((option, index) => ({
          ...omit(option, 'index'),
          id: `index-${index}`,
        })),
      }),
    })),
  };

  return result;
};
