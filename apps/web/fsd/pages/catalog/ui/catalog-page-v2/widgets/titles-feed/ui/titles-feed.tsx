import type { ComponentProps } from 'react';

import deepmerge from 'deepmerge';

import { cn } from '@re/ui-kit/utils/cn';

import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';

import * as TitlesFeedClient from './titles-feed.client';

export const TitlesFeedRoot = async (props: TitlesFeedClient.TitlesFeedRootProps & {}) => {
  const { children, filtersOptions, initialState: initialStateProps = {} } = props;

  const initialState = deepmerge(
    {
      filters: {
        ordering: {
          value: '-score',
          isActive: true,
        },
      },
    },
    initialStateProps
  );

  return (
    <TitlesFeedClient.TitlesFeedRoot filtersOptions={filtersOptions} initialState={initialState}>
      {children}
    </TitlesFeedClient.TitlesFeedRoot>
  );
};

interface TitlesFeedContentProps extends TitlesFeedClient.TitlesFeedContentProps {
  className?: string;
}

export const TitlesFeedSkeleton = (props: TitlesFeedClient.TitlesFeedLayoutProps) => {
  const { className, responsiveFilters, layout } = props;

  return (
    <TitlesFeedClient.TitlesFeedLayout
      className={cn(className)}
      responsiveFilters={responsiveFilters}
      layout={layout}
    >
      {new Array(18).fill(0).map((_, index) => (
        <VerticalTitleCardSkeleton key={index} />
      ))}
    </TitlesFeedClient.TitlesFeedLayout>
  );
};

export const TitlesFeedContent = (props: TitlesFeedContentProps) => {
  const { layout, className, ...rest } = props;

  return (
    <TitlesFeedClient.TitlesFeedContent
      fallback={<TitlesFeedSkeleton className={className} layout={layout} {...rest} />}
      layout={layout}
      className={className}
      {...rest}
    />
  );
};

interface TitlesFeedRootContainerProps extends ComponentProps<'div'> {}

export const TitlesFeedRootContainer = (props: TitlesFeedRootContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={cn('sticky-container flex max-w-screen gap-6', className)} {...rest}>
      {children}
    </div>
  );
};
