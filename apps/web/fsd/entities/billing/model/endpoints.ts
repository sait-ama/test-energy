import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { ExchangeRateQuerySchema, WithDrawByIdParamsSchema } from '~shared/api/models/billing';
import { UrlBuilder } from '~shared/utils/url-formatter';

export namespace BillingEndpoints {
  export namespace Withdraw {
    export const byWId: ToolkitEndpointBuilder<WithDrawByIdParamsSchema, any> = ({
      params,
      query,
    }) => new UrlBuilder(`/api/billing/withdraw/${params!.id}`).query(query).build();
    export const base: ToolkitEndpointBuilder<void, any> = ({ query }) =>
      new UrlBuilder(`/api/billing/withdraw/`).query(query).build();
  }
  export const withdraw: ToolkitEndpointBuilder<any, any> = () =>
    new UrlBuilder('/api/billing/withdraw/').build();
  export const charge: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/v2/billing/charge/').build();
  export const paypalAction: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/v2/billing/paypal/action/').build();
  export const exchangeRate: ToolkitEndpointBuilder<void, ExchangeRateQuerySchema> = ({ query }) =>
    new UrlBuilder('/api/v2/billing/exchange/').query(query).build();
  export const coinsExchange: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder('/api/v2/billing/coins-exchange/').build();
  export namespace Billing {
    export const promocodes = () => `/api/billing/promo-codes/`;
  }
  export const donate = () => `/api/billing/donate/`;
}
