import type { Ctx } from '~shared/utils/cookie-service';
import { CookieService } from '~shared/utils/cookie-service';

export namespace PublisherCookieKeys {
  export interface Params {
    publisherId: number;
    userId: number;
  }
  export interface Response {
    nationality: number;
    collaboration_type: number;
  }
  export const getLastContractValues = (params: Params, ctx?: Ctx): Response | undefined => {
    const cookieInstance = CookieService.get(
      PublisherCookieKeys.lastContractValuesKey(params),
      ctx
    );
    if (cookieInstance) return JSON.parse(cookieInstance);
    return undefined;
  };
  export const setLastContractValues = (
    predicate: Params,
    setter: (params: Response) => Response
  ) => {
    const value = PublisherCookieKeys.getLastContractValues(predicate);
    if (value)
      CookieService.set(PublisherCookieKeys.lastContractValuesKey(predicate), setter(value));
  };

  export const lastContractValuesKey = (params: Params) => JSON.stringify(params);
}
