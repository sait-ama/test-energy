import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace SubscriptionEndpoints {
  export const getSubscriptionInfo: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/billing/premium/').build();
  export const buySubscription: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/billing/premium/').build();
  export const deactivateSubscription: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/billing/premium/').build();
  export const renewSubscription: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/billing/premium/').build();
}
