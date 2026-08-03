import { z } from 'zod';

export const CommonSettingsPublisherValidator = z.object({
  description: z.string().superRefine((text: string, ctx) => {
    const val = text.replace(/(<([^>]+)>)/gi, '');
    if (val.length > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 1000,
        type: 'string',
        inclusive: true,
        message: 'Описание должно быть меньше 1000 символов',
      });
    }
  }),
  cover: z.string().optional(),
  wallpaper: z.string().or(z.string().base64()).optional(),
  tagline: z.string().min(3).max(40),
  name: z.string().min(3).max(30),
});
export type CommonSettingsPublisherValidatorSchema = z.infer<
  typeof CommonSettingsPublisherValidator
>;
