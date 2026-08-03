'use client';
import type { CSSProperties, ReactNode, RefObject } from 'react';

import { TitleList } from '@re/api/generated/types.gen';
import LikeContainedIcon from '@re/ui-kit/icons/like-contained';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import {
  TitleCardBookmarkState,
  TitleCardRating,
} from '~entities/title/ui/title-card-base/title-card-base';
import { TitleImage } from '~entities/title/ui/title-image';
import { TitleLink } from '~entities/title/ui/title-link';
import { FieldItemProps } from '~features/search/ui/search';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export type HorizontalTitleCard = TitleSchemaFragment | TitleList;

interface HorizontalCardProps<T extends HorizontalTitleCard, G extends boolean = false> {
  model: T | null;
  getHref?: (contentType: string, title: T) => string;
  tag?: ReactNode;
  ref?: RefObject<G extends true ? HTMLDivElement : typeof TitleLink>;
  isLoading?: boolean;
  className?: string;
  rating?: ReactNode;
  style?: CSSProperties;
  baseDomain?: string;
  actions?: ReactNode;
  subtitle?: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  onClick?: () => void;
  [key: `data-${string}`]: NumberIsomorphic | boolean;
}

export const HorizontalTitleCard = <T extends HorizontalTitleCard, TDiv extends boolean = false>(
  props: HorizontalCardProps<T, TDiv> & Omit<FieldItemProps, 'asDiv'> & { asDiv?: TDiv }
) => {
  const {
    ref,
    model,
    tag = model?.bookmark_type,
    actions,
    baseDomain,
    style,
    rating = model?.avg_rating,
    className,
    isLoading,
    size = 'md',
    asDiv,
    subtitle = (
      <div className="flex gap-2.5">
        {/* <ReText
            size="xs"
            color="muted-foreground"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <SkeletonSlot
              containerClassName="w-[30px]"
              show={isLoading}
              render={
                <>
                  <Eye size={16} className="mb-0.5" />
                  {getAbbreviatedNumber(model?.total_views)}
                </>
              }
            />
          </ReText> */}

        <ReText
          size="xs"
          className="text-muted-foreground flex items-center gap-1.5 whitespace-nowrap"
        >
          <SkeletonSlot
            containerClassName="w-[30px]"
            show={isLoading}
            render={
              <>
                <LikeContainedIcon className="-mt-[2px] size-3.5 fill-current" />
                {getAbbreviatedNumber(model?.total_votes ?? 0)}
              </>
            }
          />
        </ReText>

        {/* <ReText
            size="xs"
            color="muted-foreground"
            className="hidden items-center gap-1 whitespace-nowrap xl:flex"
          >
            <SkeletonSlot
              containerClassName="w-[30px]"
              show={isLoading}
              render={
                <>
                  <Bookmarks size={16} />
                  {getAbbreviatedNumber(model?.count_bookmarks ?? 0)}
                </>
              }
            />
          </ReText> */}
      </div>
    ),
    ...rest
  } = props;

  const ageSubmitted = useAgeSubmitted((v) => v.ageSubmitted);
  const explicit = !ageSubmitted && (model?.is_erotic || model?.is_yaoi);
  const contentType = useContentType();
  const Comp = asDiv ? 'div' : TitleLink;

  const p = {
    dir: model?.dir,
    tab: Routing.Title.TitleDetailTabs.MAIN,
    content: contentType,
    baseDomain,
    title: model?.id,
    prefetch: false,
    shallow: false,
  };

  return (
    <Comp
      {...(asDiv ? {} : { ...p })}
      ref={ref}
      title={`${model?.type?.name} ${model?.main_name} ${model?.issue_year}`}
      className={cn(
        'cs-title-card cs-title-horizontal-card',
        'group dark:bg-card relative flex w-full items-center gap-4 overflow-hidden !rounded-md bg-white p-2 select-none',
        !isLoading && 'dark:hover:border-primary dark:hover:bg-accent/20 transition-colors',
        className
      )}
      style={style}
      data-id={model?.id}
      {...rest}
    >
      {!isLoading ? (
        <div
          className={cn('absolute top-3 right-0 flex w-full items-center justify-end gap-2 px-3', {
            'justify-end': !tag,
          })}
        >
          <TitleCardBookmarkState className="z-[3]">{tag}</TitleCardBookmarkState>
          <TitleCardRating>{rating}</TitleCardRating>
        </div>
      ) : null}

      <TitleImage
        isLoading={isLoading}
        src={model?.cover?.[TITLE_PREVIEW_SIZE]}
        alt={model?.main_name ?? 'Тайтл'}
        fill
        priority
        blur={explicit}
        className={cn(
          size === 'xs' && 'w-12 md:w-12 lg:w-16',
          size === 'sm' && 'w-20 md:w-22 lg:w-24',
          size === 'md' && 'w-20 md:w-24 lg:w-28'
        )}
      />

      <div className="flex flex-col">
        <div className="mb-2">
          <ReText
            size="xs"
            indent="xxs"
            color="muted-foreground"
            lineClamp={1}
            className="mb-1 text-ellipsis"
          >
            <SkeletonSlot
              show={isLoading}
              count={0.5}
              render={
                <>
                  {model?.type?.name} {model?.issue_year}
                </>
              }
            />
          </ReText>
          <ReText
            // size={size === 'xs' ? 'sm' : 'md'}
            weight="semibold"
            lineClamp={2}
            className={cn(
              'md:text-md text-sm leading-[1.25] text-balance',
              size === 'md' && 'text-md leading-[1.35] font-semibold md:text-[16px]'
            )}
          >
            <SkeletonSlot
              show={isLoading}
              count={1.5}
              render={model?.main_name || model?.secondary_name}
            />
          </ReText>
        </div>
        {subtitle}
      </div>
      {actions}
    </Comp>
  );
};
