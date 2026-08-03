import type { ComponentType } from 'react';
import { type ComponentProps } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { LikeHeroCard } from '~entities/inventory/ui/hero-card-preview/hero-card-like';
import { useOnReroute } from '~shared/hooks/use-on-reroute';

import { useHeroCardPreviewModalStore } from '../../model/stores';
import { HeroCard } from '../hero-card';

import { HeroCardPreview, type HeroCardPreviewProps } from './hero-card-preview';

export type HeroCardPreviewModalContentProps = Omit<HeroCardPreviewProps<ComponentType>, 'card'> & {
  contentProps?: ComponentProps<typeof DialogContent>;
};

export const HeroCardPreviewModalContent = (props: HeroCardPreviewModalContentProps) => {
  const { contentProps, ...otherProps } = props;
  const { currentCard, isSingleCard, closeModal } = useHeroCardPreviewModalStore();

  if (!currentCard) return null;
  return (
    <DialogContent
      className={cn(
        isSingleCard
          ? 'w-[300px] translate-y-[-60%] border-none bg-transparent p-0 max-sm:p-6 md:w-[320px]'
          : 'sm:mt-[215px] sm:max-w-[450px]',
        contentProps?.className
      )}
      onEscapeKeyDown={closeModal}
      onInteractOutside={closeModal}
      {...contentProps}
    >
      <DialogTitle className="sr-only">Превью карточки</DialogTitle>
      {isSingleCard ? (
        <HeroCard card={currentCard} imgSize="high" {...otherProps} />
      ) : (
        <HeroCardPreview
          prevLineSlot={
            <LikeHeroCard
              className={cn('bg-secondary border-0 border-none')}
              color="secondary"
              initialData={currentCard}
            />
          }
          card={currentCard}
          controlsOptions={{
            rewrites: { isSoundEnabled: true },
          }}
          {...otherProps}
        />
      )}
    </DialogContent>
  );
};

export const HeroCardPreviewModalRoot = () => {
  const { isOpen, closeModal } = useHeroCardPreviewModalStore();

  useOnReroute(closeModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <HeroCardPreviewModalContent />
    </Dialog>
  );
};
