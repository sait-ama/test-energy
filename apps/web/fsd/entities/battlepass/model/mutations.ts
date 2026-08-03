import type { DefaultError } from '@tanstack/query-core';

import { BattlepassQueryKeys } from '~entities/battlepass/model/query-keys';
import { BattlePassRepository } from '~entities/battlepass/model/repository';
import {
  BattlePassCompleteTaskRequestSchema,
  BattlePassReplaceTaskRequestSchema,
} from '~shared/api/models/battlepass';
import { getQueryClient, useOptimisticMutation } from '~shared/api/react-query';

export const useJoinBattlepass = () =>
  useOptimisticMutation({
    mutationFn: () => BattlePassRepository.join({}),
    invalidate: [BattlepassQueryKeys.current({})],
  });

export const useCompleteBattlepassTask = () =>
  useOptimisticMutation<void, DefaultError, BattlePassCompleteTaskRequestSchema>({
    mutationFn: (data) => BattlePassRepository.completeTask({ data }),
    invalidate: [BattlepassQueryKeys.current({}), BattlepassQueryKeys.tasks({})],
  });

export const useSwapBattlepassTask = () =>
  useOptimisticMutation<void, DefaultError, BattlePassReplaceTaskRequestSchema>({
    mutationFn: (data) => BattlePassRepository.swapTask({ data }),
    invalidate: [BattlepassQueryKeys.current({}), BattlepassQueryKeys.tasks({})],
  });

export const useCheckVkTask = () =>
  useOptimisticMutation<void>({
    mutationFn: (data) => BattlePassRepository.checkVkTask({ data }),
    invalidate: [BattlepassQueryKeys.current({}), BattlepassQueryKeys.tasks({})],
  });

export const useManageMinigame = () =>
  useOptimisticMutation<void, DefaultError, { game_id: number }>({
    // (46, 'Собрать пазл (внешняя мини-игра)'),
    // (47, 'Выиграть в три в ряд (внешняя мини-игра)'),
    // (48, 'Сыграть в Найди пару (внешняя мини-игра)'),
    // (49, 'Пройти квиз (внешняя мини-игра)'),
    // (49, 'Пройти 5 слов (внешняя мини-игра)'),
    // (50, 'Собери 2048 (внешняя мини-игра)'),
    onSuccess: async () => {
      const client = getQueryClient();
      client.removeQueries({ queryKey: BattlepassQueryKeys.tasks({}) });
    },
    mutationFn: (data) => BattlePassRepository.manageMinigames({ data }),
    invalidate: [BattlepassQueryKeys.current({})],
  });
