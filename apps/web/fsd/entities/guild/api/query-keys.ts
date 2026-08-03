import {
  v2ClubsRequestsRetrieveQueryKey,
  v2ClubsRetrieve2QueryKey,
} from '~shared/api/generated/tanstack';
import type { ClubListQuerySchema } from '~shared/api/models/guild-club';
import { queryKit } from '~shared/api/react-query';

export namespace ClubKeys {
  export const clubsListQueryKeyUniquePart = 'guild-list';
  export const clubsListQueryKey = queryKit.createQueryKey<
    { cache?: boolean },
    ClubListQuerySchema
  >((variables) => [clubsListQueryKeyUniquePart, { ...variables, authDepend: true }]);

  export const clubsRetrieveQueryKey = v2ClubsRetrieve2QueryKey;

  export const clubsRequestsListQueryKey = v2ClubsRequestsRetrieveQueryKey;
}
