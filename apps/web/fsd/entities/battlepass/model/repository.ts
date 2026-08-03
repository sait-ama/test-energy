import { BattlePassEndpoints } from '~entities/battlepass/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import {
  BattlePassCheckAccessRequestSchema,
  BattlePassCompleteTaskRequestSchema,
  BattlePassCurrentResponseSchema,
  BattlePassListTasksListResponseSchema,
  BattlePassManageMinigamesRequestSchema,
  BattlePassPreviewResponseSchema,
  BattlePassReplaceTaskRequestSchema,
  BatttlePassClaimRewardRequestSchema,
} from '~shared/api/models/battlepass';

const createBattlepassRouter = apiToolkit(({ toolbox, api }) => ({
  tasks: toolbox.createMethod<BattlePassListTasksListResponseSchema, void, void, void>(
    (variables, opts) => api.get(BattlePassEndpoints.tasks(variables), opts)
  ),
  current: toolbox.createMethod<BattlePassCurrentResponseSchema, void, void, void>(
    (variables, opts) => api.get(BattlePassEndpoints.current(variables), opts)
  ),
  preview: toolbox.createMethod<BattlePassPreviewResponseSchema, void, void, void>(
    (variables, opts) => api.get(BattlePassEndpoints.preview(variables), opts)
  ),
  join: toolbox.createMethod<void, void, void, void>((variables, opts) =>
    api.post(BattlePassEndpoints.join(variables), opts)
  ),
  completeTask: toolbox.createMethod<void, BattlePassCompleteTaskRequestSchema, void, void>(
    (variables, opts) => api.post(BattlePassEndpoints.tasks(variables), variables.data, opts)
  ),
  swapTask: toolbox.createMethod<void, BattlePassReplaceTaskRequestSchema, void, void>(
    (variables, opts) => api.put(BattlePassEndpoints.swapTask(variables), variables.data, opts)
  ),
  checkVkTask: toolbox.createMethod<void, void, void, void>((variables, opts) =>
    api.get(BattlePassEndpoints.checkVkTask(variables), opts)
  ),
  claimReward: toolbox.createMethod<void, BatttlePassClaimRewardRequestSchema, void, void>(
    (variables, opt) => api.post(BattlePassEndpoints.claimReward(variables), variables.data, opt)
  ),
  checkAccess: toolbox.createMethod<void, BattlePassCheckAccessRequestSchema, void, void>(
    (variables, opts) => api.post(BattlePassEndpoints.checkAccess(variables), variables.data, opts)
  ),
  manageMinigames: toolbox.createMethod<void, BattlePassManageMinigamesRequestSchema, void, void>(
    (variables, opts) =>
      api.post(BattlePassEndpoints.manageMinigames(variables), variables.data, opts)
  ),
}));

export namespace BattlePassRepository {
  export const {
    tasks,
    current,
    manageMinigames,
    preview,
    join,
    completeTask,
    swapTask,
    checkVkTask,
    claimReward,
    checkAccess,
  } = createBattlepassRouter({ api });
}
