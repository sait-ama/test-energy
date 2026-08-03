import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace BattlePassEndpoints {
  export const join: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/join/').build();
  export const tasks: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/tasks/').build();
  export const swapTask: ToolkitEndpointBuilder<void, void> = tasks;
  export const checkAccess: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/check-access/').build();
  export const preview: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/current/preview/').build();
  export const current: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/current/').build();
  export const checkVkTask: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/functions/check-vk-group/').build();
  export const manageMinigames: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/manage-minigames/').build();
  export const claimReward: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/battlepass/current/').build();
}
