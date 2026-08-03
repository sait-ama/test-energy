import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import cloneDeep from 'lodash.clonedeep';
import { useTranslations } from 'use-intl';

import { client } from '~shared/api/client';
import { v2QuizzesCreateMutation, v2QuizzesUpdateMutation } from '~shared/api/generated/tanstack';
import { QuizQuestionType } from '~shared/api/models/quiz';
import { Routing } from '~shared/config/routing';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QUIZ_FORM_CONFIG, QuizFormMode } from './const';
import { QuizFormSchema } from './schema';
import { createEmptyQuestion, createEmptyQuestionOption, serializeFormValues } from './utils';

// Quiz root

interface QuizContextSchema {
  actions: {
    addQuestion: () => void;
    // swapQuestions: () => void;
  };
}

export const QuizContext = createContext<QuizContextSchema | null>(null);

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider = ({ children }: QuizProviderProps) => {
  const { setValue, getValues } = useFormContext<QuizFormSchema>();

  const addQuestion: QuizContextSchema['actions']['addQuestion'] = useCallback(() => {
    const questions = getValues('questions');

    if (questions.length >= QUIZ_FORM_CONFIG.questions.max) return;

    const newValue = [...questions, createEmptyQuestion()];

    setValue('questions', newValue);
  }, []);

  const context: QuizContextSchema = {
    actions: {
      addQuestion,
    },
  };
  return <QuizContext.Provider value={context}>{children}</QuizContext.Provider>;
};

// QuizMutate: QuizCreate or QuizEdit

interface QuizMutateContextSchema {
  mode: QuizFormMode;
  actions: {
    handleSubmit: () => void;
  };
}

export const QuizMutateContext = createContext<QuizMutateContextSchema | null>(null);

interface QuizCreateProviderProps {
  children: ReactNode;
  onSuccess?: (data: Quiz) => void;
}

export const QuizCreateProvider = ({ children, onSuccess }: QuizCreateProviderProps) => {
  const tQuiz = useTranslations('quiz');

  const form = useFormContext<QuizFormSchema>();

  const { getValues, handleSubmit: handleSubmitForm } = form;

  const { mutateAsync: createQuiz } = useMutation(v2QuizzesCreateMutation({ client }));

  const resolveErrors = useErrorHandler({ form });

  const handleSubmit = useMemo(
    () =>
      handleSubmitForm(
        async () => {
          const values = getValues();

          const body = serializeFormValues(values);

          const toast = await importToastAsync();

          try {
            const data = await createQuiz({ body });

            toast.success(tQuiz('messages.create-success'));
            onSuccess?.(data);
          } catch (e) {
            logger.error(e);
            resolveErrors(e);
          }
        },
        (e) => logger.error(e, { scope: ['local'] })
      ),
    []
  );

  const context: QuizMutateContextSchema = {
    mode: QuizFormMode.CREATE,
    actions: {
      handleSubmit,
    },
  };

  return <QuizMutateContext.Provider value={context}>{children}</QuizMutateContext.Provider>;
};

interface QuizEditProviderProps {
  children: ReactNode;
  id: string;
}

export const QuizEditProvider = ({ children, id }: QuizEditProviderProps) => {
  const tQuiz = useTranslations('quiz');

  const router = useRouter();

  const form = useFormContext<QuizFormSchema>();
  const { getValues, handleSubmit: handleSubmitForm } = form;

  const { mutateAsync: updateQuiz } = useMutation(v2QuizzesUpdateMutation({ client }));

  const resolveErrors = useErrorHandler({ form });

  const handleSubmit = useMemo(
    () =>
      handleSubmitForm(
        async () => {
          const values = getValues();

          const body = serializeFormValues(values);

          const toast = await importToastAsync();

          try {
            await updateQuiz({ body, path: { quiz_id: id } });

            toast.success(tQuiz('messages.edit-success'));
            router.push(Routing.Quiz.detail({ params: { id } }));
          } catch (e) {
            logger.error(e);
            resolveErrors(e);
          }
        },
        (e) => logger.error(e, { scope: ['local'] })
      ),
    []
  );

  const context: QuizMutateContextSchema = {
    mode: QuizFormMode.CREATE,
    actions: {
      handleSubmit,
    },
  };

  return <QuizMutateContext.Provider value={context}>{children}</QuizMutateContext.Provider>;
};

// QuizQuestion

interface QuizQuestionContextSchema {
  index: number;
  question: QuizFormSchema['questions'][number];
  hasCorrect: boolean;
  actions: {
    setHasCorrect: Dispatch<SetStateAction<boolean>>;
    addOption: () => void;
    swapOptions: (index1: number, index2: number) => void;
    changeType: (type: QuizQuestionType) => void;
    copyQuestion: () => void;
    removeQuestion: () => void;
  };
}

export const QuizQuestionContext = createContext<QuizQuestionContextSchema | null>(null);

interface QuizQuestionProviderProps {
  children: ReactNode;
  index: number;
}

export const QuizQuestionProvider = ({ children, index }: QuizQuestionProviderProps) => {
  const { control, setValue, getValues } = useFormContext<QuizFormSchema>();
  const question = useWatch({ control, name: `questions.${index}` });

  const [hasCorrect, setHasCorrect] = useState(false);

  const addOption: QuizQuestionContextSchema['actions']['addOption'] = useCallback(() => {
    const newOption = createEmptyQuestionOption();

    const options = getValues(`questions.${index}.options`) || [];

    if (options.length >= QUIZ_FORM_CONFIG.options.max) return;

    setValue(`questions.${index}.options`, [...options, newOption]);
  }, [index]);

  const swapOptions: QuizQuestionContextSchema['actions']['swapOptions'] = useCallback(
    (index1, index2) => {
      const options = [...(getValues(`questions.${index}.options`) || [])];

      const [val1, val2] = [options[index1], options[index2]] as const;

      if (!val1 || !val2) return;

      options[index1] = { ...val2 };
      options[index2] = { ...val1 };

      setValue(`questions.${index}.options`, options);
    },
    [index]
  );

  const changeType: QuizQuestionContextSchema['actions']['changeType'] = useCallback(
    (type) => {
      const currentType = question.type;

      if (currentType === type) return;

      const currentValue = getValues(`questions.${index}`);
      setValue(`questions.${index}.type`, type);

      if (currentType === QuizQuestionType.SINGLE && type === QuizQuestionType.MULTI) return;

      if (currentType === QuizQuestionType.MULTI && type === QuizQuestionType.SINGLE) {
        const options = cloneDeep(getValues(`questions.${index}.options`) || []);

        options.forEach((option, index) => {
          // make first correct after type change
          option.is_correct = !index;
        });

        setValue(`questions.${index}.options`, options);
        return;
      }

      const emptyQuestion = createEmptyQuestion(type);

      setValue(`questions.${index}`, {
        ...emptyQuestion,
        question: currentValue.question,
        description: currentValue.description,
      });
    },
    [question.type, index]
  );

  const copyQuestion: QuizQuestionContextSchema['actions']['copyQuestion'] = useCallback(() => {
    const questions = [...getValues('questions')];

    if (questions.length >= QUIZ_FORM_CONFIG.questions.max) return;

    const currentQuestion = questions[index]!;

    questions.splice(index + 1, 0, cloneDeep(currentQuestion));

    setValue('questions', questions);
  }, [index]);

  const removeQuestion: QuizQuestionContextSchema['actions']['removeQuestion'] = useCallback(() => {
    const questions = [...getValues('questions')];

    if (questions.length <= QUIZ_FORM_CONFIG.questions.min) return;
    questions.splice(index, 1);

    setValue('questions', questions);
  }, [index]);

  const context: QuizQuestionContextSchema = {
    index,
    question,
    hasCorrect,
    actions: {
      setHasCorrect,
      addOption,
      swapOptions,
      changeType,
      copyQuestion,
      removeQuestion,
    },
  };

  return <QuizQuestionContext.Provider value={context}>{children}</QuizQuestionContext.Provider>;
};

// QuizQuestionOption

interface QuizQuestionOptionContextSchema {
  index: number;
  option: NonNullable<QuizFormSchema['questions'][number]['options']>[number];
  actions: {
    removeOption: () => void;
    changeChecked: (type: QuizQuestionType) => void;
  };
}

export const QuizQuestionOptionContext = createContext<QuizQuestionOptionContextSchema | null>(
  null
);

interface QuizQuestionOptionProviderProps {
  index: number;
  children: ReactNode;
}

export const QuizQuestionOptionProvider = ({
  children,
  index: optionIndex,
}: QuizQuestionOptionProviderProps) => {
  const { control, getValues, setValue } = useFormContext<QuizFormSchema>();

  const { index: questionIndex } = useStrictContext(QuizQuestionContext);
  const option = useWatch({ control, name: `questions.${questionIndex}.options.${optionIndex}` });

  const removeOption: QuizQuestionOptionContextSchema['actions']['removeOption'] =
    useCallback(() => {
      const options = [...(getValues(`questions.${questionIndex}.options`) || [])];

      if (options.length <= 1) return;

      options.splice(optionIndex, 1);

      setValue(`questions.${questionIndex}.options`, options);
    }, [optionIndex, questionIndex]);

  const changeChecked: QuizQuestionOptionContextSchema['actions']['changeChecked'] = useCallback(
    (type) => {
      if (type === QuizQuestionType.SINGLE) {
        const options = cloneDeep(getValues(`questions.${questionIndex}.options`) || []);

        options.forEach((option, index) => {
          option.is_correct = index === optionIndex ? !option.is_correct : false;
        });

        setValue(`questions.${questionIndex}.options`, options);
      }
    },
    [optionIndex, questionIndex]
  );

  const context: QuizQuestionOptionContextSchema = {
    index: optionIndex,
    option,
    actions: {
      removeOption,
      changeChecked,
    },
  };

  return (
    <QuizQuestionOptionContext.Provider value={context}>
      {children}
    </QuizQuestionOptionContext.Provider>
  );
};
