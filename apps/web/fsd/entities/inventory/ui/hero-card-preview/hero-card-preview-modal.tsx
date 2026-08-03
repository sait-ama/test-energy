import { type ComponentProps, ComponentType, forwardRef, type ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import type { HeroCardSchema } from '~shared/api/models/inventory';

import { HeroCard } from '../hero-card';

import { HeroCardPreview, type HeroCardPreviewProps } from './hero-card-preview';

// Legacy modal component
export type HeroCardPreviewModalProps = Omit<HeroCardPreviewProps<ComponentType>, 'card'> & {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  contentProps?: ComponentProps<typeof DialogContent>;
  disableModal?: boolean;
  card?: HeroCardSchema;
  isSingleCard?: boolean;
  prevLineSlot?: ReactNode;
  underCardComponent?: ReactNode;
};

export const HeroCardPreviewModal = forwardRef((props: HeroCardPreviewModalProps, ref: any) => {
  const {
    children,
    card,
    open,
    onOpenChange,
    contentProps,
    disableModal,
    isSingleCard,
    prevLineSlot,
    underCardComponent,
    ...other
  } = props;

  if (!card) return children;

  return (
    <Dialog open={disableModal ? false : open} onOpenChange={onOpenChange}>
      {children ? (
        <DialogTrigger asChild>
          <div className="cursor-pointer" ref={ref}>
            {children}
          </div>
        </DialogTrigger>
      ) : null}
      <DialogContent
        className={cn(
          'relative overflow-visible border-none bg-transparent p-0',
          isSingleCard ? 'w-[300px] md:w-[320px]' : 'sm:max-w-[450px sm:mt-[215px]'
        )}
        {...contentProps}
      >
        <div
          className={cn(
            'relative w-full overflow-visible p-4',
            isSingleCard ? 'border-none bg-transparent p-0 max-sm:p-6' : 'bg-background rounded-xl',
            contentProps?.className
          )}
        >
          <DialogTitle className="sr-only">Превью карточки</DialogTitle>
          {isSingleCard ? (
            <HeroCard
              controlsOptions={{ rewrites: { isSoundEnabled: true } }}
              card={card}
              imgSize="high"
              {...other}
            />
          ) : (
            <HeroCardPreview
              prevLineSlot={prevLineSlot}
              controlsOptions={{ rewrites: { isSoundEnabled: null } }}
              card={card}
              {...other}
            />
          )}
        </div>
        {underCardComponent && <div className="mb-2">{underCardComponent}</div>}
      </DialogContent>
    </Dialog>
  );
});
