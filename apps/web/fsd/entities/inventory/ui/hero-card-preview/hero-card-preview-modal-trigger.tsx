import { ComponentProps, memo, ReactNode } from 'react';

import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import { HeroCardSchema } from '~shared/api/models/inventory';

import { useHeroCardPreviewModalStore } from '../../model/stores';

// Trigger component using Zustand store
export type HeroCardPreviewModalTriggerProps = {
  card: HeroCardSchema;
  children: ReactNode;
  isSingleCard?: boolean;
  asChild?: boolean;
} & ComponentProps<'div'>;

export const HeroCardPreviewModalTrigger = memo(
  ({
    card,
    children,
    isSingleCard = false,
    asChild,
    className,
    ...rest
  }: HeroCardPreviewModalTriggerProps) => {
    const openModal = useHeroCardPreviewModalStore((v) => v.openModal);
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        {...rest}
        className={cn('cursor-pointer', className)}
        onClick={() => openModal(card, isSingleCard)}
      >
        {children}
      </Comp>
    );
  }
);
