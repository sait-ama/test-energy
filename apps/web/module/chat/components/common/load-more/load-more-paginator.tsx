import React, { PropsWithChildren } from 'react';

import type { PaginatorProps } from './../../../types/types';
import { LoadMoreButton as DefaultLoadMoreButton, LoadMoreButtonProps } from './load-more-button';

export type LoadMorePaginatorProps = PaginatorProps & {
  LoadMoreButton?: React.ComponentType<LoadMoreButtonProps>;
  reverse?: boolean;
};

export const UnMemoizedLoadMorePaginator = (props: PropsWithChildren<LoadMorePaginatorProps>) => {
  const {
    children,
    hasNextPage,
    isLoading,
    LoadMoreButton = DefaultLoadMoreButton,
    loadNextPage,
    reverse,
  } = props;

  return (
    <>
      {!reverse && children}
      {hasNextPage && <LoadMoreButton isLoading={isLoading} onClick={loadNextPage} />}
      {reverse && children}
    </>
  );
};

export const LoadMorePaginator = React.memo(
  UnMemoizedLoadMorePaginator
) as typeof UnMemoizedLoadMorePaginator;
