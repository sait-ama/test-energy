import { ComponentPropsWithoutRef, Fragment, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import { ReText } from '@re/ui-kit/ui/text';

import { QUIZ_QUESTION_TYPE } from '~shared/api/models/quiz';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSeparateMessage,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { cn } from '~shared/utils/cn';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QuizFormSchema } from '../model/schema';
import { QuizContext, QuizItemContext } from '../model/store';

interface QuizQuestionSingleBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizQuestionSingleBody = (props: QuizQuestionSingleBodyProps) => {
  const { className, ...rest } = props;

  const { control } = useFormContext<QuizFormSchema>();
  const { question } = useStrictContext(QuizItemContext);
  const { formDisabled, config } = useStrictContext(QuizContext);

  const options = useMemo(
    () => [...(question.options || [])].toSorted((a, b) => a.index - b.index),
    [question]
  );

  return (
    <div className={cn('', className)} {...rest}>
      <FormField
        control={control}
        name={`answers.id_${question.id}.answer`}
        render={({ field }) => (
          <FormItem>
            <RadioGroup
              disabled={formDisabled}
              onValueChange={field.onChange}
              className="flex flex-col space-y-1"
            >
              {options.map((it) => (
                <FormItem key={it.id} className="flex items-center space-y-0 space-x-3">
                  <FormControl>
                    <RadioGroupInputItem value={it.id} />
                  </FormControl>
                  <FormLabel
                    className={cn(
                      'text-foreground text-md mb-0! cursor-pointer font-normal',
                      config.size === 'md' ? 'text-sm' : 'text-md',
                      field.value !== it.id && 'text-muted-foreground'
                    )}
                  >
                    {it.value}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

interface QuizQuestionMultiBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizQuestionMultiBody = (props: QuizQuestionMultiBodyProps) => {
  const { className, ...rest } = props;

  const { control } = useFormContext<QuizFormSchema>();
  const { question } = useStrictContext(QuizItemContext);
  const { formDisabled, config } = useStrictContext(QuizContext);

  const options = useMemo(
    () => [...(question.options || [])].toSorted((a, b) => a.index - b.index),
    [question]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {options.map((it, index) => (
        <FormField
          key={it.id}
          control={control}
          name={`answers.id_${question.id}.answer.${index}`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  disabled={formDisabled}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? it.id : null);
                  }}
                />
              </FormControl>
              <FormLabel
                className={cn(
                  'text-foreground mb-0! cursor-pointer font-normal',
                  config.size === 'md' ? 'text-sm' : 'text-md',
                  !field.value && 'text-muted-foreground'
                )}
              >
                {it.value}
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

interface QuizQuestionTextBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizQuestionTextBody = (props: QuizQuestionTextBodyProps) => {
  const { className, ...rest } = props;

  const { control } = useFormContext<QuizFormSchema>();
  const { question } = useStrictContext(QuizItemContext);
  const { formDisabled, config } = useStrictContext(QuizContext);

  return (
    <div className={cn('', className)} {...rest}>
      <FormField
        control={control}
        name={`answers.id_${question.id}.answer`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                inputClassName={cn(config.size === 'md' ? 'text-sm' : 'text-md')}
                disabled={formDisabled}
                placeholder="Ответ"
                {...field}
                type="text"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

interface QuizQuestionScoreBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizQuestionScoreBody = (props: QuizQuestionScoreBodyProps) => {
  const { className, ...rest } = props;

  const { control } = useFormContext<QuizFormSchema>();
  const { question } = useStrictContext(QuizItemContext);
  const { formDisabled, config } = useStrictContext(QuizContext);

  return (
    <div className={cn('', className)} {...rest}>
      <FormField
        control={control}
        name={`answers.id_${question.id}.answer`}
        render={({ field }) => (
          <FormItem>
            <RadioGroup
              disabled={formDisabled}
              onValueChange={field.onChange}
              className="flex flex-col items-start gap-4 sm:flex-row sm:items-end"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
                <FormItem
                  key={score}
                  className="flex flex-row items-center justify-center gap-2 sm:flex-col"
                >
                  <FormControl>
                    <RadioGroupInputItem value={score} className="sm:order-2" />
                  </FormControl>
                  <FormLabel
                    className={cn(
                      'text-foreground! mb-0! cursor-pointer font-normal sm:order-1',
                      config.size === 'md' ? 'text-sm!' : 'text-md!'
                    )}
                  >
                    {score}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export interface QuizQuestionProps extends ComponentPropsWithoutRef<'div'> {}

export const QuizQuestion = ({ className, ...rest }: QuizQuestionProps) => {
  'use no memo';
  const { question } = useStrictContext(QuizItemContext);
  const { config } = useStrictContext(QuizContext);

  const QuizQuestionBody = useMemo(() => {
    if (question.type === QUIZ_QUESTION_TYPE.MULTI) return QuizQuestionMultiBody;
    if (question.type === QUIZ_QUESTION_TYPE.SINGLE) return QuizQuestionSingleBody;
    if (question.type === QUIZ_QUESTION_TYPE.TEXT) return QuizQuestionTextBody;
    if (question.type === QUIZ_QUESTION_TYPE.SCORE) return QuizQuestionScoreBody;
    return Fragment;
  }, [question]);

  return (
    <div
      className={cn(
        'bg-secondary',
        config.size === 'md' ? '' : 'border-border rounded-md border p-5',
        className
      )}
      {...rest}
    >
      <ReText size={config.size === 'md' ? 'md' : 'lg'} weight="semibold">
        {question.index + 1}.&nbsp;{question.question}
      </ReText>
      {question.description ? (
        <ReText className="mt-3" color="muted-foreground" size="sm">
          {question.description}
        </ReText>
      ) : null}
      <FormSeparateMessage name={`answers.id_${question.id}`} />
      <QuizQuestionBody className="mt-3" />
    </div>
  );
};
