import { BattlepassQueryKeys } from '~entities/battlepass/model/query-keys';
import { BattlePassRepository } from '~entities/battlepass/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  BattlePassCurrentResponseSchema,
  BattlePassListTasksListResponseSchema,
  BattlePassPreviewResponseSchema,
} from '~shared/api/models/battlepass';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useBattlepassTasks, getKey: getBattlepassTasks } =
  queryKit.createSuspenseQuery<EndpointMeta<void, void>, BattlePassListTasksListResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: BattlepassQueryKeys.tasks(variables),
      queryFn: () => BattlePassRepository.tasks(variables, fetchOptions),
    })
  );

export const { useQuery: useCurrentBattlepass, getKey: getCurrentBattlepass } =
  queryKit.createSuspenseQuery<EndpointMeta<void, void>, BattlePassCurrentResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: BattlepassQueryKeys.current(variables),
      queryFn: () => BattlePassRepository.current(variables, fetchOptions),
    })
  );

export const { useQuery: useBattlepassPreview, getKey: getBattlepassPreview } =
  queryKit.createSuspenseQuery<EndpointMeta<void, void>, BattlePassPreviewResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: BattlepassQueryKeys.preview(variables),
      queryFn: () => BattlePassRepository.preview(variables, fetchOptions),
    })
  );
