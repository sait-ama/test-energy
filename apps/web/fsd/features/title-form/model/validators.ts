import { z } from 'zod';

export const BaseTitleValidator = z
  .object({
    title: z.object({
      main_name: z.string(),
      secondary_name: z.string(),
      another_name: z.string().optional(),
      type: z.number(),
      wallpaper: z.string().or(z.string().base64()).optional(),
      cover: z.string().or(z.string().base64()),
      status: z.number(),
      age_limit: z.number(),
      issue_year: z.number().or(z.string()),
      translate_status: z.number().optional(),
      categories: z.array(z.number()),
      genres: z.array(z.number()),
      creators: z.array(z.number()).optional(),
      adaptation_id: z.number().optional(),
      description: z.string().optional(),
      forbidden_fields: z.array(z.string()).optional(),
      user_message: z.string().optional(),
      branches: z.any(),
    }),
    additional: z.object({
      hasAdditional: z.boolean().optional(),
      links: z.array(
        z.object({
          type: z.string(),
          value: z.string().url(),
        })
      ),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.title.type !== 4) {
      if (data.title.translate_status === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['title.translate_status'],
          message: 'Поле обязательно к заполнению',
        });
      }
      if (!data.additional.links.find((link) => link.type === 'original_link')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['additional.links'],
          message: 'Ссылка на оригинал обязательна. Укажите в секции "Ссылки"',
        });
      }
    }
  });

export type BaseTitleSchema = z.infer<typeof BaseTitleValidator> & { main_name: string };
