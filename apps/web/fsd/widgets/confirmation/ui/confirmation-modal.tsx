import React from 'react';

import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { useConfirmationStore } from '~shared/lib/submit-action/use-submit-action';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const ConfirmationModal = () => {
  const params = useConfirmationStore((v) => v.params);
  const onClose = useConfirmationStore((v) => v.closeConfirmation);

  if (!params) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-lg', params.className)}>
        <DialogTitle className="sr-only">Форма подтверждения действия</DialogTitle>

        <div className="mb-[-170px] flex -translate-y-[160px] justify-center">
          <LinearGradient
            width={153}
            height={213}
            src={UrlFormatter.media('public/modal/question-girl.webp')}
            className="pointer-events-none select-none after:[--r-linear-gradient-color:hsl(var(--r-background))]"
            alt="Девочка"
          />
        </div>

        <DialogHeader className="px-[10%]">
          <DialogTitle className="text-center">{params.title}</DialogTitle>
          {params.description ? (
            <DialogDescription className="text-center">{params.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {params.body ?? false}
        <DialogFooter className="!flex-row justify-center gap-2">
          <Button variant={params.closeVariant} onClick={params.onClose}>
            {params.closeText}
          </Button>
          <Button variant={params.confirmVariant} onClick={params.onConfirm}>
            {params.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
