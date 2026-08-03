import { z } from 'zod';

import type { WithDrawRequestSchema } from '~shared/api/models/billing';

export const CreateWithDrawValidatorMaker = ({
  maxSum,
  minSum,
}: {
  maxSum: number;
  minSum: number;
}) =>
  z.object({
    sum: z.string().refine((v) => +v <= maxSum && +v >= minSum, {
      message: `Сумма вывода этой команды - от ${minSum} до ${maxSum}`,
    }),
    purse: z.string(),
  } satisfies Record<keyof Omit<WithDrawRequestSchema, 'publisher'>, any>);
