import type { ReactNode } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import type { HeroCardSchema } from '~shared/api/models/inventory';
import { linkBaseVariants } from '~shared/ui/link-base';

interface HeroCardDropButtonProps {
  children: ReactNode;
  onClick: () => void;
}

const HeroCardDropButton = ({ onClick, children }: HeroCardDropButtonProps) => (
  <ReText component="span" onClick={onClick} className={linkBaseVariants()}>
    {children}
  </ReText>
);

export interface HeroCardDropProps {
  card: HeroCardSchema;
  onPreviewOpen?: () => void;
}

export const HeroCardDrop = (props: HeroCardDropProps) => {
  const { card, onPreviewOpen } = props;

  const handleClick = () => onPreviewOpen?.();

  const name = card?.character?.name;

  if (!card) return null;

  return (
    <div className="flex items-center justify-center gap-2 rounded-md p-4">
      <ReText size="xl">🎴</ReText>
      <ReText weight="medium" size="sm">
        Вам выпала {name ? 'карточка' : null} <br />
        <HeroCardDropButton onClick={handleClick}>
          {name || 'Коллекционная карточка'}
        </HeroCardDropButton>
        &nbsp;
        {card.rank ? `(${card?.rank?.slice(5).toUpperCase()})` : null}
      </ReText>
    </div>
  );
};
