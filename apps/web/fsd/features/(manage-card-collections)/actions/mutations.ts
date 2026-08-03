import { v2InventoryCollectionsDestroyMutation } from '@re/api/generated/@tanstack/react-query.gen';
import { useMutation } from '@tanstack/react-query';

import { usePaginatedUserCardCollections } from '~entities/card-collections/model/utils';
import { client } from '~shared/api/client';

export const useRemoveCollection = ({
  collectionId,
  userId,
}: {
  collectionId: number;
  userId: number;
}) => {
  const paginatedMutator = usePaginatedUserCardCollections({ userId, collectionId });
  return useMutation({
    ...v2InventoryCollectionsDestroyMutation({ client, path: { collection_id: collectionId } }),
    onSuccess: async () => {
      paginatedMutator((card) => card.id !== collectionId, 'filter');
    },
  });
};
