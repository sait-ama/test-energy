import { z } from 'zod';

export const ChargeFormValidator = (limits: Record<string, number>) =>
  z
    .object({
      method: z.string(),
      amount: z.number().min(100),
    })
    .superRefine((data, ctx) => {
      const max = limits[data.method] || limits.default!;

      if (data.amount > max) {
        ctx.addIssue({
          path: ['amount'],
          code: z.ZodIssueCode.too_big,
          maximum: max,
          type: 'number',
          inclusive: true,
        });
      }
    });

export type ChargeFormValidatorSchema = z.infer<ReturnType<typeof ChargeFormValidator>>;
