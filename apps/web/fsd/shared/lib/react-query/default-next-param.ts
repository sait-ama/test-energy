import { MinimalPaginationResponse, PaginationResponse } from '~shared/types/buisines';

export const defaultNextParam = <
  TPageParam extends number,
  TQueryFnData extends MinimalPaginationResponse,
>(
  lastPage: TQueryFnData,
  _allPages: TQueryFnData[],
  lastPageParam: TPageParam,
  _allPageParams: TPageParam[]
) => {
  if (!lastPage.next) return null;

  return lastPageParam + 1;
};

export const defaultPreviousParam = <
  TPageParam extends number,
  TQueryFnData extends PaginationResponse,
>(
  firstPage: TQueryFnData,
  // @ts-ignore
  _,
  firstPageParam: TPageParam
) => {
  if (!firstPage.previous) return null;
  if (firstPageParam - 1 <= 0) return null;

  return firstPageParam - 1;
};
