'use client';
import type { ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import { TitleImage } from '~entities/title/ui/title-image';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';

import { TitleLink } from './title-link';

export interface HorizontalSimpleTitleCardProps<T = TitleSchemaFragment> {
  model: TitleSchemaFragment;
  isLoading?: boolean;
  className?: string;
  baseDomain?: string;
  actions?: ReactNode;
  asDiv?: boolean;
  size?: 'xs' | 'sm' | 'normal';
  [key: `data-${string}`]: NumberIsomorphic | boolean;
}

export const HorizontalSimpleTitleCard = forwardRef(
  <T extends TitleSchemaFragment>(
    props: HorizontalSimpleTitleCardProps<T>,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const {
      model,
      baseDomain,
      actions,
      className,
      isLoading,
      asDiv = true,
      size = 'normal',
      ...rest
    } = props;

    const { ageSubmitted } = useAgeSubmitted();
    const explicit = !ageSubmitted && (model?.is_erotic || model?.is_yaoi);

    const contentType = useContentType();
    const Comp = asDiv ? 'div' : TitleLink;

    const p = {
      dir: model?.dir,
      tab: Routing.Title.TitleDetailTabs.MAIN,
      content: contentType,
      baseDomain,
      title: model?.main_name,
      prefetch: false,
      shallow: false,
    };

    return (
      <Comp
        ref={ref}
        {...(asDiv ? {} : { ...p })}
        className={cn(
          'cs-horizontal-title-card border-border bg-background-content flex w-full flex-col items-center justify-between gap-4 overflow-hidden !rounded-md border p-2 md:flex-row',
          !isLoading && 'dark:hover:border-primary dark:hover:bg-accent/20 transition-colors',
          className
        )}
        data-id={model?.id}
        {...rest}
      >
        <div className="flex w-full items-center gap-4">
          <TitleImage
            isLoading={isLoading}
            src={model?.cover?.[TITLE_PREVIEW_SIZE]}
            alt={model?.main_name ?? 'Тайтл'}
            fill
            priority
            blur={explicit}
            className={cn(
              size === 'normal' && 'w-20 md:w-24 lg:w-28',
              size === 'sm' && 'w-8 md:w-12 lg:w-12',
              size === 'xs' && 'w-8 md:w-10 lg:w-10'
            )}
          />

          <div className="mb-2 w-full">
            <ReText
              size="xs"
              indent="xxs"
              color="muted-foreground"
              lineClamp={1}
              className="text-ellipsis"
            >
              <SkeletonSlot show={isLoading} count={0.5} render={model?.type?.name} />
            </ReText>
            <ReText
              // size={size === 'xs' ? 'sm' : 'md'}
              weight="medium"
              lineClamp={2}
              className="leading-[1.25] text-balance"
            >
              <SkeletonSlot
                show={isLoading}
                count={1}
                render={model?.main_name || model?.secondary_name}
              />
            </ReText>
          </div>
        </div>
        {actions}
      </Comp>
    );
  }
);
