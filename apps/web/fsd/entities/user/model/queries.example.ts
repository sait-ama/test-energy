import { createQueryGenerated, createQueryInfiniteGenerated } from '@re/api/exports-core';
import { keepPreviousData } from '@tanstack/query-core';

import { client } from '~shared/api/client';
import {
  v2UsersAchievementsListInfiniteOptions,
  v2UsersBadgesOwnersRetrieveInfiniteOptions,
  v2UsersBadgesRetrieveOptions,
  v2UsersHaveCardListInfiniteOptions,
  v2UsersRequestsRetrieveOptions,
  v2UsersTopRetrieveInfiniteOptions,
} from '~shared/api/generated/tanstack';
//s+i s+d
//q+i q+d
const createQueryGeneratedWithClient = createQueryGenerated({ client });
const createQueryInfiniteGeneratedWithClient = createQueryInfiniteGenerated({ client });
export const getUserAchievementsGenerated = createQueryInfiniteGeneratedWithClient(
  v2UsersAchievementsListInfiniteOptions
);
// const { data } = useInfiniteQuery(getUserAchievementsGenerated({ api: { path: { user_id: 1 } } }));
// const data = useApiGenSuspenseInfiniteQuery(
//   getUserAchievementsGenerated({
//     api: { path: { user_id: 1 } },
//     suspense: true,
//   })
// );

export const getUserRequest = createQueryGeneratedWithClient(v2UsersRequestsRetrieveOptions);
export const getUserTop = createQueryInfiniteGeneratedWithClient(
  v2UsersTopRetrieveInfiniteOptions,
  {
    placeholderData: keepPreviousData,
  }
);
export const reV2UsersHaveCardListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2UsersHaveCardListInfiniteOptions,
  {
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  }
);
export const reV2UsersBadgesRetrieveOptions = createQueryGeneratedWithClient(
  v2UsersBadgesRetrieveOptions
);
export const reV2UsersBadgesOwnersRetrieveOptions = createQueryInfiniteGeneratedWithClient(
  v2UsersBadgesOwnersRetrieveInfiniteOptions,
  {
    staleTime: Infinity,
  }
);
