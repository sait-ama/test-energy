import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace TopEndpoints {
  // TODO transfer to another place ?
  export const tabs = () => new UrlBuilder(`/api/v2/titles/top/tabs/`).build();
}
