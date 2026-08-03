import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { CharacterSchema } from '~shared/api/models/character';
import { default as Placeholder } from '~shared/assets/placeholders/title';

import { CharacterImage } from './character-image';

export interface SquareCharacterCardProps {
  model?: CharacterSchema | null | undefined;
  imgSize?: 'low' | 'mid' | 'high';
  onClick?: () => void;
  withHover?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
}

export const SquareCharacterCard = (props: SquareCharacterCardProps) => {
  const { model, onClick, withHover, isActive = false, isLoading = false } = props;

  if (!model || isLoading) return <Skeleton className="aspect-square rounded-md select-none" />;

  return (
    <div
      onClick={onClick}
      className={cn('bg-secondary relative aspect-square overflow-hidden rounded-md select-none', {
        ['hover-card']: withHover ?? !!onClick,
        ['!border-primary border']: isActive,
      })}
    >
      <div className="flex size-full items-center justify-center">
        {model?.cover?.mid ? (
          <CharacterImage
            isLoading={isLoading}
            imgSrc={model.cover.mid}
            alt={model.name}
            className="!h-full !w-full after:absolute after:bottom-0 after:left-0 after:size-full after:rounded-[0] after:bg-[linear-gradient(180deg,transparent_40%,hsl(var(--r-secondary))_100%)]"
            imageClassName="h-full w-full"
          />
        ) : (
          <Placeholder size={32} />
        )}
      </div>
      <div className="absolute bottom-0 left-0 px-2 pt-0 pb-2">
        <ReText lineClamp={2} size="sm" weight="semibold" color="secondary-foreground">
          {model.name}
        </ReText>
      </div>
    </div>
  );
};
