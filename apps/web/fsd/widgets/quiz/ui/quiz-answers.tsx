import { ComponentPropsWithoutRef, CSSProperties, Fragment, useMemo } from 'react';

import { CheckIcon } from '@re/ui-kit/icons/check';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import { ReText } from '@re/ui-kit/ui/text';

import { QUIZ_QUESTION_TYPE } from '~shared/api/models/quiz';
import { Input } from '~shared/ui/input';
import { cn } from '~shared/utils/cn';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QuizContext, QuizItemContext } from '../model/store';
import { getOptionStatus, OptionStatus } from '../model/utils';

const StatusIcon = ({ className, status }: { className?: string; status: OptionStatus }) => {
  if (status === 'empty' || status === 'wrong' || status === 'right') return null;

  return <CheckIcon className={cn('text-muted-foreground', className)} />;
};

interface QuizAnswerSingleBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizAnswerSingleBody = (props: QuizAnswerSingleBodyProps) => {
  const { className } = props;

  const store = useStrictContext(QuizItemContext);
  const { config } = useStrictContext(QuizContext);

  const answer = store.answer!.answer as number;
  const question = store.question;
  const hasCorrect = useMemo(() => question.options!.some((it) => it.is_correct), [question]);

  const options = useMemo(
    () =>
      [...(question.options || [])]
        .toSorted((a, b) => a.index - b.index)
        .map((it) => ({
          ...it,
          isChoosen: answer == it.id,
        })),
    [question]
  );

  return (
    <RadioGroup value={answer} disabled className={cn('flex flex-col space-y-1', className)}>
      {options.map((it) => {
        const status = getOptionStatus(it.isChoosen, it.is_correct);

        return (
          <div key={it.id} className="flex items-center space-y-0 space-x-3">
            <RadioGroupInputItem
              value={it.id}
              className={cn(
                status === 'right' && 'text-success',
                status === 'wrong' && 'text-danger'
              )}
            />

            <label
              className={cn(
                'text-foreground mb-0! font-normal',
                config.size === 'md' ? 'text-sm' : 'text-md'
              )}
            >
              {it.value}
            </label>
            {hasCorrect ? <StatusIcon status={status} /> : null}
          </div>
        );
      })}
    </RadioGroup>
  );
};

const mapCheckboxBg = (status: OptionStatus) => {
  if (status === 'right') return 'hsl(var(--r-success))';
  if (status === 'wrong') return 'hsl(var(--r-danger))';

  return 'hsl(var(--r-primary))';
};

interface QuizAnswerMultiBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizAnswerMultiBody = (props: QuizAnswerMultiBodyProps) => {
  const { className, ...rest } = props;

  const store = useStrictContext(QuizItemContext);
  const { config } = useStrictContext(QuizContext);

  const answer = store.answer!.answer as number[];
  const question = store.question;

  const hasCorrect = useMemo(() => question.options!.some((it) => it.is_correct), [question]);

  const options = useMemo(
    () =>
      [...(question.options || [])]
        .toSorted((a, b) => a.index - b.index)
        .map((it) => ({
          ...it,
          isChoosen: answer.includes(it.id),
        })),
    [question]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {options.map((it) => {
        const status = getOptionStatus(it.isChoosen, it.is_correct);

        return (
          <div className="flex flex-row items-center space-y-0 space-x-3" key={it.id}>
            <Checkbox
              style={
                {
                  ['--checkbox-bg']: mapCheckboxBg(status),
                } as CSSProperties
              }
              checked={answer.includes(it.id)}
              disabled
            />

            <label
              className={cn(
                'text-foreground mb-0! font-normal',
                config.size === 'md' ? 'text-sm' : 'text-md'
              )}
            >
              {it.value}
            </label>

            {hasCorrect ? <StatusIcon status={status} /> : null}
          </div>
        );
      })}
    </div>
  );
};

interface QuizAnswerTextBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizAnswerTextBody = (props: QuizAnswerTextBodyProps) => {
  const { className, ...rest } = props;
  const store = useStrictContext(QuizItemContext);

  const answer = store.answer!.answer as string;

  return (
    <div className={cn('', className)} {...rest}>
      <Input placeholder="Ответ" disabled value={answer} type="text" className="bg-background" />
    </div>
  );
};

interface QuizAnswerBodyProps extends ComponentPropsWithoutRef<'div'> {}

const QuizAnswerScoreBody = (props: QuizAnswerBodyProps) => {
  const { className, ...rest } = props;
  const store = useStrictContext(QuizItemContext);
  const { config } = useStrictContext(QuizContext);

  const answer = store.answer!.answer as number;

  return (
    <div className={cn('', className)} {...rest}>
      <RadioGroup
        value={answer}
        disabled
        className="flex flex-col items-start gap-4 sm:flex-row sm:items-end"
      >
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
          <div key={score} className="flex flex-row items-center justify-center gap-2 sm:flex-col">
            <RadioGroupInputItem value={score} className="sm:order-2" />
            <label
              className={cn(
                'text-foreground mb-0 font-normal sm:order-1',
                config.size === 'md' ? 'text-sm' : 'text-md'
              )}
            >
              {score}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

interface QuizAnswerProps extends ComponentPropsWithoutRef<'div'> {}

export const QuizAnswer = ({ className, ...rest }: QuizAnswerProps) => {
  const { question } = useStrictContext(QuizItemContext);
  const { config } = useStrictContext(QuizContext);

  const QuizAnswerBody = useMemo(() => {
    if (question.type === QUIZ_QUESTION_TYPE.MULTI) return QuizAnswerMultiBody;
    if (question.type === QUIZ_QUESTION_TYPE.SINGLE) return QuizAnswerSingleBody;
    if (question.type === QUIZ_QUESTION_TYPE.TEXT) return QuizAnswerTextBody;
    if (question.type === QUIZ_QUESTION_TYPE.SCORE) return QuizAnswerScoreBody;
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
      <ReText weight="semibold" size={config.size === 'md' ? 'md' : 'lg'}>
        {question.index + 1}.&nbsp;{question.question}
      </ReText>
      <ReText color="muted-foreground" size="sm">
        {question.description}
      </ReText>
      <QuizAnswerBody className="mt-3" />
    </div>
  );
};
