import {
  v2TitlesCollectionsListInfiniteQueryKey,
  v2TitlesCollectionsRetrieveQueryKey,
} from '~shared/api/generated/tanstack';

export namespace CollectionsKeys {
  export const list = v2TitlesCollectionsListInfiniteQueryKey;
  export const retrieve = v2TitlesCollectionsRetrieveQueryKey;
}
