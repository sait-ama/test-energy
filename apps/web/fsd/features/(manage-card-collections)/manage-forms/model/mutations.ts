import { client } from '~shared/api/client';
import {
  v2InventoryCollectionsCreateMutation,
  v2InventoryCollectionsUpdateMutation,
} from '~shared/api/generated/tanstack';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useCreateCollectionCards = () =>
  useOptimisticMutation({
    ...v2InventoryCollectionsCreateMutation({ client }),
  });
export const useUpdateCollectionCards = () =>
  useOptimisticMutation({
    ...v2InventoryCollectionsUpdateMutation({ client }),
    // mutationKey: ['create-collection', { params: { userId, collectionId } }],
    // mutationFn: CardCollectionsRepository.update,
  });
