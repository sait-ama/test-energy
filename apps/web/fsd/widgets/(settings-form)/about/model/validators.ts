import { z } from 'zod';

export const ClubChangeFormValidator = z.object({
  name: z.string().min(2).max(50),
  description: z.string().superRefine((text: string, ctx) => {
    const val = text.replace(/(<([^>]+)>)/gi, '');
    if (val.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 10,
        type: 'string',
        inclusive: true,
      });
    }

    if (val.length > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 500,
        type: 'string',
        inclusive: true,
      });
    }
  }),
  is_public: z.boolean().optional().default(false),
  avatar: z.string().or(z.string().base64()).optional(),
  wallpaper: z.string().or(z.string().base64()).optional(),
});
