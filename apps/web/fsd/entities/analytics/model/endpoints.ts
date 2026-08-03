import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';

export namespace AnalyticsEndpoints {
  export const saveUserUrchinTrackingModule: ToolkitEndpointBuilder<void, void> = () =>
    '/api/users/utm-user-history/';
  export const savePromoAction: ToolkitEndpointBuilder<void, void> = () =>
    '/api/dashboard/promo/render/';
}
