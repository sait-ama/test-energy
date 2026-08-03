'use client';
import type { DefaultError } from '@tanstack/query-core';

import { FriendRepository } from '~entities/friend/model/repository';
import { changeUserParamsLocally } from '~entities/user/model/mutations';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CreateFriendRequestSchema,
  FriendStatus,
  UpdateFriendShipStatusRequestSchema,
  UpdateFriendShipStatusResponseSchema,
} from '~shared/api/models/friend';
import type { EmojiSchema } from '~shared/api/models/shop';
import type {
  DetailedUserParamsSchema,
  DetailedUserQuerySchema,
  DetailedUserSchema,
} from '~shared/api/models/user';
import { FriendsShipStatus } from '~shared/api/models/user';
import { customSkipToken, useOptimisticMutation } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';

export const setFriendUserStatusQuery = (
  variables: EndpointMeta<DetailedUserParamsSchema, DetailedUserQuerySchema>,
  status: FriendStatus
) => {
  // @ts-ignore
  changeUserParamsLocally({
    variables,
    mutator: (u) => ({ ...u, friend_status: status }),
  });
};
export const useCreateManageCurrentUserFriendRequestMutation = () => {
  const userId = useSession((v) => v?.id);
  return useOptimisticMutation<
    void,
    DefaultError,
    Omit<CreateFriendRequestSchema, 'user_id'>,
    { to_user: number }
  >({
    onMutate: ({ to_user }) => {
      setFriendUserStatusQuery(
        {
          params: {
            userId: String(to_user),
          },
        },
        FriendsShipStatus.WAITING
      );

      return { to_user };
    },
    onError: (_1, _2, context) => {
      if (context?.to_user) {
        // getQueryClient().setQueryData(UserKeys.detailById({ params: { userId: String(context?.to_user) } }), (v) => ({ ...v, status: 'no_friends' }));

        setFriendUserStatusQuery(
          {
            params: {
              userId: String(context.to_user),
            },
          },
          FriendsShipStatus.NO_FRIENDS
        );
      }
    },
    mutationFn: (data) => {
      // throw new Error('sasa');
      if (!userId) return customSkipToken;
      return FriendRepository.createFriendshipRequest({
        data: { ...data, user_id: userId },
        params: { userId },
      });
    },
  });
};

export const useRemoveFriendMutation = (friendId: number) => {
  const userId = useSession((v) => v?.id)!;
  let oldUser: DetailedUserSchema | undefined;

  return useOptimisticMutation<void, void, void, { oldUser: typeof oldUser }>({
    onMutate: () => {
      changeUserParamsLocally({
        variables: { params: { userId: String(friendId) } },
        mutator: (u) => {
          oldUser = u;
          return { ...u, friend_status: null };
        },
      });

      return { oldUser };
    },
    onError: (_1, _2, context) => {
      const oldUser = context?.oldUser;
      if (oldUser)
        changeUserParamsLocally({
          variables: { params: { userId: String(friendId) } },
          mutator: () => oldUser,
        });
    },
    mutationFn: () =>
      FriendRepository.removeFriendship({
        params: {
          userId,
          friendId,
        },
      }),
  });
};
export const useChangeFriendStatus = ({
  userId,
  friendId,
}: {
  userId: NumberIsomorphicV2;
  friendId: NumberIsomorphicV2;
}) => {
  return useOptimisticMutation<
    UpdateFriendShipStatusResponseSchema,
    DefaultError,
    UpdateFriendShipStatusRequestSchema & { name: string; emoji: EmojiSchema }
  >({
    mutationFn: (data) =>
      FriendRepository.changeFriendShipStatus({
        params: { friend_id: friendId, user_id: userId },
        data: { status: data.status },
      }),
    onMutate: async ({ status: id, ...data }) => {
      changeUserParamsLocally({
        variables: { params: { userId: friendId.toString() } },
        mutator: (v) =>
          !v
            ? v
            : {
                ...v,
                friend_meta: !v.friend_meta
                  ? v.friend_meta
                  : {
                      status: { emoji: data.emoji.id, name: data.name },
                      created: new Date().toDateString(),
                    },
              },
      });
    },
  });
};
//
