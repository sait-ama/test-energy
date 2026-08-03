'use client';

import type { ReactNode } from 'react';
import { memo } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import {
  TitleCardBookmarkState,
  TitleCardContent,
  TitleCardRating,
  TitleCardRoot,
  TitleCardRootProps,
  TitleCardSubtitle,
  TitleCardTitle,
  TitleImage,
} from '~entities/title/ui/title-card-base/title-card-base';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';

export interface VerticalCardProps<T extends TitleSchemaFragment> extends TitleCardRootProps {
  model: T | null;
  subtitle?: ReactNode;
  tag?: ReactNode;
  rating?: ReactNode;

  [key: `data-${string}`]: NumberIsomorphic | boolean;
}

export const VerticalTitleCard = memo(
  <T extends TitleSchemaFragment>(props: VerticalCardProps<T>) => {
    const { model, tag, ref, rating, className, ...rest } = props;

    const { ageSubmitted } = useAgeSubmitted();

    const explicit = !ageSubmitted && (model?.is_erotic || model?.is_yaoi);

    return (
      <TitleCardRoot
        ref={ref}
        title={`${model?.type?.name} ${model?.main_name} ${model?.issue_year}`}
        data-id={model?.id}
        className={cn('group', className)}
        {...rest}
      >
        <TitleImage
          src={model?.cover.mid}
          className={cn({ 'blur-sm': explicit })}
          slot={
            <>
              <TitleCardBookmarkState className="absolute top-1 left-1 max-w-[90%] truncate bg-black/70 text-white">
                {tag || model?.bookmark_type}
              </TitleCardBookmarkState>
              <TitleCardRating className="absolute right-1 bottom-1 bg-black/50 text-white">
                {rating || model?.avg_rating}
              </TitleCardRating>
            </>
          }
        />
        <TitleCardContent>
          <TitleCardSubtitle>{`${model?.type?.name} ${model?.issue_year}`}</TitleCardSubtitle>
          <TitleCardTitle>{model?.main_name}</TitleCardTitle>
        </TitleCardContent>
      </TitleCardRoot>
    );
  }
);
