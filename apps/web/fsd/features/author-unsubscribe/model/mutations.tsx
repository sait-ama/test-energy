import type { InfiniteData } from '@tanstack/query-core';

import { UserSubscriptionRepository } from '~entities/user-subscriptions/model/repository';
import type {
  SubContentType,
  UpdateSubscriptionResponseSchema,
  UserSubscriptionsPaginatedListResponseSchema,
} from '~shared/api/models/user-subscriptions';
import { queryClient, useOptimisticMutation } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';
import { AppQueryKey } from '~shared/types/react-query';

export const useUnFollowOptimisticSubscriptionMutation = ({
  id,
  sub_type,
}: {
  sub_type: SubContentType;
  id: number | number[];
}) => {
  const session = useSession();
  return useOptimisticMutation<UpdateSubscriptionResponseSchema>({
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<UserSubscriptionsPaginatedListResponseSchema>>(
        {
          predicate: ({ queryKey }) => {
            const [primary, extra] = queryKey as AppQueryKey<
              void,
              {
                sub_type: string;
                user_id: string;
              },
              string
            >;
            return primary === 'subscriptions' && extra?.query?.sub_type === sub_type;
          },
          type: 'all',
        },
        (data) => {
          if (!data?.pages.length) return data;
          return {
            ...data,
            pages: data?.pages.map((page) => ({
              ...page,
              results: page.results.filter((res) => res.id !== id),
            })),
          };
        }
      );
    },
    mutationKey: [
      'subscriptions',
      'unfollow',
      {
        entityId: id,
        userId: session?.id,
        sub_type: sub_type,
        operation: 'unfollow',
      },
    ],
    mutationFn: () =>
      UserSubscriptionRepository.Subscriptions.changeSubs({
        data: {
          operation: 'remove',
          [sub_type]: Array.isArray(id) ? id : [Number(id)],
        },
      }),
  });
};
