import { BillingEndpoints } from '~entities/billing/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit } from '~shared/api/api-toolkit';
import type {
  ChargeResponseSchema,
  CreateChargeRequestSchema,
  CreateChargeResponseSchema,
  CreatePaypalActionRequestSchema,
  CreatePaypalActionResponseSchema,
  CurrencyExchangeRateResponseSchema,
  CurrencyExchangeRequestSchema,
  DonateRequestSchema,
  ExchangeRateQuerySchema,
  ExchangeRateResponseSchema,
  WithDrawByIdParamsSchema,
  WithDrawRequestSchema,
} from '~shared/api/models/billing';

const createBillingRouter = apiToolkit(({ toolbox, api }) => ({
  getCharge: toolbox.createMethod<ChargeResponseSchema, void, void, void>((_, opts) =>
    api.get<ChargeResponseSchema>(BillingEndpoints.charge({}), opts)
  ),
  createCharge: toolbox.createMethod<
    CreateChargeResponseSchema,
    CreateChargeRequestSchema,
    void,
    void
  >((variables, opts) => api.post(BillingEndpoints.charge({}), variables.data, opts)),
  createWithDraw: toolbox.createMethod<void, WithDrawRequestSchema, any, any>((variables, opts) =>
    api.post(BillingEndpoints.Withdraw.base(variables), variables.data, opts)
  ),
  deleteWithDraw: toolbox.createMethod<void, void, WithDrawByIdParamsSchema, any>(
    ({ params, query }, opts) =>
      api.delete(BillingEndpoints.Withdraw.byWId({ params, query }), undefined, opts)
  ),
  paypalAction: toolbox.createMethod<
    CreatePaypalActionResponseSchema,
    CreatePaypalActionRequestSchema,
    void,
    void
  >((variables, opts) => api.post(BillingEndpoints.paypalAction({}), variables.data, opts)),
  getExchangeRate: toolbox.createMethod<
    ExchangeRateResponseSchema,
    void,
    void,
    ExchangeRateQuerySchema
  >((variables, opts) => api.get(BillingEndpoints.exchangeRate(variables), opts)),
  getCoinsExchange: toolbox.createMethod<CurrencyExchangeRateResponseSchema, void, void, void>(
    (variables, opts) => api.get(BillingEndpoints.coinsExchange(variables), opts)
  ),
  coinsExchange: toolbox.createMethod<void, CurrencyExchangeRequestSchema, void, void>(
    (variables, opts) => api.post(BillingEndpoints.coinsExchange(variables), variables.data, opts)
  ),
  donate: toolbox.createMethod<void, DonateRequestSchema, void, void>((variables, opts) =>
    api.post(BillingEndpoints.donate(), variables.data, opts)
  ),
}));
//  const handleRemoveCard = useCallback(
//         (card_id) => {
//             DELETE_CATCH(`/api/publishers/${publisher}/cards/`, { card_id }).then(mutate);
//         },
//         [mutate]
//     );
export namespace BillingRepository {
  export const {
    getCharge,
    donate,
    createWithDraw,
    createCharge,
    getExchangeRate,
    paypalAction,
    getCoinsExchange,
    coinsExchange,
  } = createBillingRouter({
    api,
  });
}
