import type { ExchangeRateQuerySchema } from '~shared/api/models/billing';
import { queryKit } from '~shared/api/react-query';

export namespace BillingQueryKeys {
  export const charge = queryKit.createQueryKey<void, void>((variables) => [
    'charge',
    {
      ...variables,
      authDepend: true,
    },
  ]);
  export const exchangeRate = queryKit.createQueryKey<void, ExchangeRateQuerySchema>(
    (variables) => ['exchangeRate', { authDepend: true, ...variables }]
  );
  export const coinsExchange = queryKit.createQueryKey<void, void>((variables) => [
    'coins-exchange',
    { authDepend: false, ...variables },
  ]);
}
