import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace PromotionEndpoints {
  export const list: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/titles/banner/`).build();
}
