import { z } from 'zod';

export const CollectionValidator = z.object({
  name: z.string(),
  // cover: z.string().or(null).or(undefined).optional().nullable().default(''),
  titles: z
    .object({ id: z.number() })
    .and(z.record(z.string(), z.any()))
    .array()
    .min(3, { message: 'Должно быть как минимум три тайтла' }),
  description: z.string().superRefine((text: string, ctx) => {
    const val = text.replace(/(<([^>]+)>)/gi, '');
    if (val.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 3,
        type: 'string',
        inclusive: true,
        message: 'Cлишком мелкое описание 😡',
      });
    }
    if (val.length > 2000) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 2000,
        type: 'string',
        inclusive: true,
        message: 'Cлишком большое описание 😡',
      });
    }
  }),
});

export type CollectionFormSchema = z.infer<typeof CollectionValidator>;
