'use client';

import Star from '@re/ui-kit/icons/star';

import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

interface RatingBarProps {
  rating: string;
  count: number;
  percentage: number;
  showStar?: boolean;
  delay?: number;
}

export function RatingBar({
  rating,
  count,
  percentage,
  showStar = true,
  delay = 0,
}: RatingBarProps) {
  return (
    <div className="rating-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 text-sm">
        <div className="flex w-10 justify-end">
          {showStar ? (
            <div className="flex items-center gap-2">
              <span>{rating}</span>
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            </div>
          ) : (
            <span className="text-muted-foreground">{rating}</span>
          )}
        </div>
        <div className="bg-accent relative h-2 w-full overflow-hidden rounded-full">
          <div className="progress-bar h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-muted-foreground font-semibold">{getAbbreviatedNumber(count)}</span>
      </div>
    </div>
  );
}
