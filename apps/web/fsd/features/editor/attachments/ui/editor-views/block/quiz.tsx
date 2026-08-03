import { useTranslations } from 'next-intl';

import { QuizDetail } from '@re/api/generated/types.gen';
import { CloseIcon } from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { QuizInlineCard } from '~entities/quiz/ui/quiz-inline-card';
import { Quiz as QuizWidget } from '~widgets/quiz/ui/quiz';

export interface QuizBlockViewProps {
  model: QuizDetail;
  onRemove?: () => void;
}

export const QuizBlockView = ({ model, onRemove }: QuizBlockViewProps) => {
  const t = useTranslations('reusable.entities.attachments');

  return (
    <Dialog>
      <DialogTitle className="sr-only">{t('quiz')}</DialogTitle>
      <DialogTrigger asChild>
        <QuizInlineCard
          className="my-3"
          withHover
          model={model}
          actions={
            <Button
              variant="ghost"
              circle
              onClick={(e) => {
                e.preventDefault();
                onRemove?.();
              }}
            >
              <CloseIcon />
            </Button>
          }
        />
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-lg lg:max-w-screen-lg xl:max-w-screen-xl">
        <QuizWidget model={{ ...model, answers: [] }} disabled />
      </DialogContent>
    </Dialog>
  );
};
