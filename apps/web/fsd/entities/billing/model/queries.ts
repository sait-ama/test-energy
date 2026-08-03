import { BillingQueryKeys } from '~entities/billing/model/query-keys';
import { BillingRepository } from '~entities/billing/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import {
  type ChargeResponseSchema,
  ChargeSchema,
  CurrencyExchangeRateResponseSchema,
  ExchangeRateQuerySchema,
  ExchangeRateResponseSchema,
} from '~shared/api/models/billing';
import { queryKit } from '~shared/api/react-query';

export const { useQuery: useCharge } = queryKit.createQuery<
  EndpointMeta<ChargeSchema, void>,
  ChargeResponseSchema
>(({ fetchOptions }) => ({
  queryKey: BillingQueryKeys.charge({}),
  queryFn: () => BillingRepository.getCharge({}, fetchOptions),
}));

export const { useQuery: useExchangeRate } = queryKit.createQuery<
  EndpointMeta<void, ExchangeRateQuerySchema>,
  ExchangeRateResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: BillingQueryKeys.exchangeRate(variables),
  queryFn: () => BillingRepository.getExchangeRate(variables, fetchOptions),
}));

export const { useQuery: useExchangeCoinsRate } = queryKit.createQuery<
  EndpointMeta<void, void>,
  CurrencyExchangeRateResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: BillingQueryKeys.coinsExchange(variables),
  queryFn: () => BillingRepository.getCoinsExchange(variables, fetchOptions),
}));
