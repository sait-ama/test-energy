import type { DefaultError } from '@tanstack/query-core';

import type {
  SubContentType,
  UpdateSubscriptionResponseSchema,
} from '~shared/api/models/user-subscriptions';
import { Invalidate, useOptimisticMutation } from '~shared/api/react-query';

import { UserSubscriptionRepository } from './repository';

export const useFollowMutationPostProcess = (options: { invalidate?: Invalidate }) =>
  useOptimisticMutation<
    UpdateSubscriptionResponseSchema,
    DefaultError,
    {
      operation: 'add' | 'remove';
      sub_type: SubContentType;
      id: number | number[];
    }
  >({
    ...options,
    mutationFn: ({ operation, id, sub_type }) =>
      UserSubscriptionRepository.Subscriptions.changeSubs({
        data: {
          operation,
          [sub_type]: Array.isArray(id) ? id : [id],
        },
      }),
  });
