import { v2InventoryCollectionsRetrieve2InfiniteQueryKey } from '@re/api/generated/@tanstack/react-query.gen';
import {
  CardCollection,
  CardCollectionList,
  UserRareCollection,
} from '@re/api/generated/types.gen';
import { InfiniteData } from '@tanstack/query-core';
import { useQueryClient } from '@tanstack/react-query';

export const resolvedName = (str: string) =>
  !str ? '' : str.length < 2 ? str.toUpperCase() : `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
export const canExchangeCollection = (collection: UserRareCollection) => {
  return collection.percent >= 100;
};

type Predicate = (card: CardCollection) => boolean;
type Mutator = (card: CardCollection) => Partial<CardCollection>;
const isPredicate = <T extends 'filter' | 'mutate'>(
  fn: Predicate | Mutator,
  variant?: T
): fn is Predicate => {
  return variant === 'filter' && !!fn;
};
export const usePaginatedUserCardCollections = ({
  userId,
  collectionId,
}: {
  userId: number;
  collectionId: number;
}) => {
  const queryClient = useQueryClient();
  return <T extends 'mutate' | 'filter'>(
    mutatorOrPredicate: T extends 'filter' ? Predicate : Mutator,
    variant?: T
  ) => {
    queryClient.setQueriesData<InfiniteData<CardCollectionList>>(
      {
        predicate: ({ queryKey }) => {
          const [{ _id: curId, path: { user_id } = {} }] = queryKey;
          const [{ _id: targetId }] = v2InventoryCollectionsRetrieve2InfiniteQueryKey({
            path: { user_id: userId },
          });

          return curId === targetId && String(user_id) === String(userId);
        },
      },
      (v) => {
        if (!v) return v;
        return {
          ...v,
          pages: v.pages.map((v) => ({
            ...v,
            results: isPredicate(mutatorOrPredicate, variant)
              ? v.results.filter((res) => {
                  return mutatorOrPredicate(res);
                })
              : v.results.map((res) => {
                  return res.id !== collectionId ? res : { ...res, ...mutatorOrPredicate(res) };
                }),
          })),
        };
      }
    );
  };
};
