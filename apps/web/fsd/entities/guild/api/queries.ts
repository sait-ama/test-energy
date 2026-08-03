import {
  v2ClubsRequestsRetrieveInfiniteOptions,
  v2ClubsRetrieve2Options,
  v2ClubsRetrieveInfiniteOptions,
} from '@re/api/generated/@tanstack/react-query.gen';
import type { Options } from '@re/api/generated/sdk.gen';
import type {
  V2ClubsRequestsRetrieveData,
  V2ClubsRetrieve2Data,
  V2ClubsRetrieveData,
} from '@re/api/generated/types.gen';

import { client } from '~shared/api/client';

export const getClubsInfiniteListOptions = (options: Options<V2ClubsRetrieveData>) => {
  return v2ClubsRetrieveInfiniteOptions({ ...options, client });
};

export const getClubsRetrieveQueryOptions = (options: Options<V2ClubsRetrieve2Data>) => {
  return v2ClubsRetrieve2Options({ ...options, client });
};

export const clubsRequestPaginatedListKeyOptions = (
  options: Options<V2ClubsRequestsRetrieveData>
) => v2ClubsRequestsRetrieveInfiniteOptions({ ...options, client });
