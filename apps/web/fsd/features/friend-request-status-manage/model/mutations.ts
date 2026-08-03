import { useParams } from 'next/navigation';

import type { DefaultError } from '@tanstack/query-core';
import type { QueryKey } from '@tanstack/react-query';

import { FriendQueryKeys } from '~entities/friend/model/query-keys';
import { FriendRepository } from '~entities/friend/model/repository';
import type {
  FriendRequestPaginatedListParamsSchema,
  UpdateFriendRequestQuerySchema,
  UpdateFriendRequestResponseSchema,
} from '~shared/api/models/friend';
import { queryKit, useOptimisticMutation } from '~shared/api/react-query';

export const useManageStatusFriendRequestMutation = (requestId: number, toUser: number) => {
  const { id } = useParams();

  return useOptimisticMutation<
    UpdateFriendRequestResponseSchema,
    DefaultError,
    Omit<UpdateFriendRequestQuerySchema, 'to_user'>
  >({
    mutationFn: (data) =>
      FriendRepository.updateFriendRequest({
        params: { user_id: Number(id), requestId },
        data: { ...data, to_user: toUser },
      }),
    invalidate: ({ queryKey }) => {
      if (!queryKit.isValidQueryKeyInstance(queryKey)) return false;
      const key = queryKey as QueryKey<unknown>;
      const [primary, extra] = key;
      const typedExtra = extra as QueryKey<FriendRequestPaginatedListParamsSchema>[1];
      return (
        typedExtra?.params?.userId == id && primary === FriendQueryKeys.FriendRequest.UniquePart
      );
    },
  });
};
