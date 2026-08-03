import { z } from 'zod';

export const CurrencyExchangeSchema = z.object({
  currencyCount: z
    .number()
    .min(1, 'Минимальное количество - 1')
    .max(5000, 'Максимальное количество - 5000'),
});
