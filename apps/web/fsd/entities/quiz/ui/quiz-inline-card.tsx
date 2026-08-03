import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { QuizDetail } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';

import { cn } from '~shared/utils/cn';

export interface QuizInlineCardProps extends ComponentPropsWithoutRef<'div'> {
  model: QuizDetail;
  actions?: ReactNode;
  withHover?: boolean;
}

export const QuizInlineCard = (props: QuizInlineCardProps) => {
  const { model, className, actions, withHover = false, ...rest } = props;

  return (
    <div
      className={cn(
        'bg-secondary flex items-center justify-between gap-4 rounded-md p-4',
        withHover &&
          'dark:hover:bg-accent/70 cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-none',
        className
      )}
      {...rest}
    >
      <ReText>{model.quiz.name}</ReText>
      {actions}
    </div>
  );
};
