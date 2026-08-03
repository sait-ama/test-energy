import { lazy, Suspense } from 'react';

import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { cn } from '@re/ui-kit/utils/cn';

import { LikeHeroCard } from '~entities/inventory/ui/hero-card-preview/hero-card-like';
import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { useHeroCardModal } from '~shared/lib/card/use-card-modal';

const HeroCardPreviewModal = lazy(() =>
  import(
    /* webpackChunkName: "HeroCardPreviewModal" */ '~entities/inventory/ui/hero-card-preview'
  ).then((m) => ({ default: m.HeroCardPreviewModal }))
);

export const HeroCardModalAsyncConditional = () => {
  const { card, setCard } = useHeroCardModal();

  useOnReroute(() => setCard(null));

  if (!card) return null;

  return (
    <Suspense fallback={<DialogLoading />}>
      <HeroCardPreviewModal
        prevLineSlot={
          <LikeHeroCard
            className={cn('bg-secondary border-0 border-none')}
            color="secondary"
            initialData={card}
          />
        }
        open
        onOpenChange={() => setCard(null)}
        card={card}
      />
    </Suspense>
  );
};
