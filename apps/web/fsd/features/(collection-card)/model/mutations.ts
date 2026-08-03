import { DefaultError } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createQueryKey } from '@re/api/exports-core';

import { client } from '~shared/api/client';
import {
  ShortCardItem,
  V2InventoryCompleteCollectionCreateData,
  V2InventoryRareCollectionsRetrieveData,
} from '~shared/api/generated/models';
import type { Options } from '~shared/api/generated/repositories';
import {
  v2InventoryCompleteCollectionCreateMutation,
  v2InventoryRareCollectionsRetrieveInfiniteQueryKey,
} from '~shared/api/generated/tanstack';
import { useSession } from '~shared/lib/session/use-session';

type Params = Parameters<typeof v2InventoryCompleteCollectionCreateMutation>[0];
export const useCreateExchangeMutation = (params: Params) => {
  const sessionId = useSession((v) => v?.id);
  const queryClient = useQueryClient();
  return useMutation<ShortCardItem, DefaultError, Options<V2InventoryCompleteCollectionCreateData>>(
    {
      ...v2InventoryCompleteCollectionCreateMutation({ ...params, client }),
      onSuccess: async (_, options) => {
        if (!sessionId || !options) return;

        const [targetKey] = v2InventoryRareCollectionsRetrieveInfiniteQueryKey({
          path: {
            ...options?.path,
            user_id: sessionId,
          },
        });
        await queryClient.refetchQueries({
          type: 'active',
          fetchStatus: 'idle',
          predicate: ({
            queryKey: [currentKey],
          }: {
            queryKey: ReturnType<
              typeof createQueryKey<Options<V2InventoryRareCollectionsRetrieveData>>
            >;
          }) => {
            if (!targetKey?._id || !currentKey?._id) return false;

            return (
              targetKey?._id === currentKey?._id &&
              currentKey?.path?.user_id === targetKey?.path?.user_id
            );
          },
        });
      },
    }
  );
};
