import { memo } from 'react';

import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { cn } from '~shared/utils/cn';

import { useCurrentPageTitleQuery } from '../model/hooks';

export interface TitlePromoDetailCardProps {
  className?: string;
}

export const TitlePromoDetailCard = memo((props: TitlePromoDetailCardProps) => {
  const { className } = props;

  const { data: title } = useCurrentPageTitleQuery();

  return (
    <div className={cn('bg-secondary rounded-md', className)}>
      <HorizontalTitleCard model={title} />
    </div>
  );
});
