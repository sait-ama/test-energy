import { CollectionType } from '~entities/card-collections/model/queries';
import { useQueryState } from '~shared/hooks/use-query-state-v2';

export const useCollectionCardType = () =>
  useQueryState<CollectionType, CollectionType>({
    key: 'collectionCardType',
    defaultValue: CollectionType.EXCHANGEABLE,
  });
