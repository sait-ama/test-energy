import { DefaultError } from '@tanstack/query-core';

import { BattlepassQueryKeys } from '~entities/battlepass/model/query-keys';
import { BattlePassRepository } from '~entities/battlepass/model/repository';
import { v2UsersCurrentRetrieveQueryKey } from '~shared/api/generated/tanstack';
import {
  BattlePassCheckAccessRequestSchema,
  BatttlePassClaimRewardRequestSchema,
} from '~shared/api/models/battlepass';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useClaimReward = () =>
  useOptimisticMutation<void, DefaultError, BatttlePassClaimRewardRequestSchema>({
    mutationFn: (data) => BattlePassRepository.claimReward({ data }),
    invalidate: BattlepassQueryKeys.current({}),
    invalidateV2: v2UsersCurrentRetrieveQueryKey({}),
  });

export const useCheckAccess = () =>
  useOptimisticMutation<void, DefaultError, BattlePassCheckAccessRequestSchema>({
    mutationFn: (data) => BattlePassRepository.checkAccess({ data }),
    invalidate: BattlepassQueryKeys.current({}),
  });
