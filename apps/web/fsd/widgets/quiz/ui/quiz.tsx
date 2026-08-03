import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import dayjs from 'dayjs';

import { EditIcon } from '@re/ui-kit/icons/edit';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { QuizDetail } from '~shared/api/generated/models';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';
import { Form } from '~shared/ui/form';
import { RichText } from '~shared/ui/rich-text';
import { cn } from '~shared/utils/cn';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QuizFormSchema } from '../model/schema';
import { QuizContext, QuizItemProvider, QuizProvider } from '../model/store';
import { QuizAnswer } from './quiz-answers';
import { QuizQuestion } from './quiz-questions';

export interface QuizSubmitButton extends Omit<ButtonProps, 'onClick'> {}

export const QuizSubmitButton = (props: QuizSubmitButton) => {
  const { disabled, ...rest } = props;

  const {
    actions: { handleSubmit },
  } = useStrictContext(QuizContext);

  const { formDisabled } = useStrictContext(QuizContext);

  return <Button disabled={disabled || formDisabled} onClick={handleSubmit} {...rest} />;
};

const DateEndButton = ({ dateEnd }: { dateEnd: string }) => {
  const config = useSiteConfig();
  const tReusable = useTranslations('reusable');
  const tQuiz = useTranslations('quiz');

  const isFinished = Date.now() > +new Date(dateEnd);

  const content = isFinished ? (
    <>{tQuiz('time-is-up')}</>
  ) : (
    <>
      {tReusable('conjunctions.to')}&nbsp;
      {dayjs(dateEnd).format(config.localization.dateFormat).toString()}
    </>
  );

  return (
    <Button color="background" variant="default" className="cursor-default">
      {content}
    </Button>
  );
};

const QuizContent = () => {
  const session = useSession();

  const tReusable = useTranslations('reusable');

  const { model, config, formDisabled } = useStrictContext(QuizContext);

  const isComplete = model.quiz.questions.length === model.answers.length;

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          'bg-secondary',
          config.size === 'md' ? '' : 'border-border rounded-md border p-5'
        )}
      >
        <div className="flex justify-between gap-4">
          <ReText weight="semibold" size={config.size === 'md' ? 'lg' : '2xl'}>
            {model.quiz.name}
          </ReText>
          {session?.is_staff || session?.id === model.quiz.author.id ? (
            <Button asChild circle variant="ghost">
              <Link href={Routing.Quiz.edit({ params: { id: model.quiz.id } })}>
                <EditIcon />
              </Link>
            </Button>
          ) : null}
        </div>
        <RichText
          className={cn(
            'text-muted-foreground mt-4',
            config.size === 'md' ? '!text-sm' : '!text-lg'
          )}
        >
          {model.quiz.description}
        </RichText>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild color="background" variant="default">
            <Link
              className="max-w-full"
              href={Routing.User.detail({
                params: {
                  id: model.quiz.author.id,
                  tab: 'about',
                },
              })}
            >
              {tReusable('entities.author')}:&nbsp;
              <span className="truncate">{model.quiz.author.username}</span>
            </Link>
          </Button>
          {model.quiz.end_at ? <DateEndButton dateEnd={model.quiz.end_at} /> : null}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {[...model.quiz.questions]
          .toSorted((a, b) => a.index - b.index)
          .map((question) => {
            const answer = model.answers.find((answer) => answer.question_id === question.id);

            return (
              <QuizItemProvider key={question.id} question={question} answer={answer}>
                {answer ? <QuizAnswer /> : <QuizQuestion />}
              </QuizItemProvider>
            );
          })}
      </div>
      {!isComplete && !formDisabled ? (
        <QuizSubmitButton className="mt-4 self-end">{tReusable('actions.submit')}</QuizSubmitButton>
      ) : null}
    </div>
  );
};

export interface QuizProps {
  model: QuizDetail;
  disabled?: boolean;
  config?: {
    size?: 'md' | 'lg';
    theme?: 'primary' | 'secondary';
  };
}

export const Quiz = ({ model, config, disabled }: QuizProps) => {
  const form = useForm<QuizFormSchema>({ mode: 'onChange' });

  return (
    <Form {...form}>
      <QuizProvider model={model} config={config} disabled={disabled}>
        <QuizContent />
      </QuizProvider>
    </Form>
  );
};
