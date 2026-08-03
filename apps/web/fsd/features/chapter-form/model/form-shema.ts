import { z } from 'zod';

export const AddNovelFormFieldsValidator = z.object({
  tome: z.number(),
  chapter: z.string(),
  name: z.string().optional().nullable(),
  is_paid: z.union([z.literal(0), z.literal(1)]),
  price: z.string().optional().nullable(),
  pub_date: z.string().optional(),
  delay_pub_date: z.string().optional(),
  publisher: z.array(z.number()),
  content: z.string(),
});

export type AddNovelFormFieldsSchema = z.infer<typeof AddNovelFormFieldsValidator>;

export const AddMangaFormFieldsValidator = z.object({
  tome: z.number(),
  chapter: z.string(),
  name: z.string().optional().nullable(),
  is_paid: z.union([z.literal(0), z.literal(1)]),
  price: z.string().optional().nullable(),
  pub_date: z.string().optional(),
  delay_pub_date: z.string().optional(),
  publisher: z.array(z.number()),
  file: z.instanceof(File),
});

export type AddMangaFormFieldsSchema = z.infer<typeof AddMangaFormFieldsValidator>;

export const EditNovelFormFieldsValidator = z.object({
  tome: z.number().optional(),
  chapter: z.string().optional(),
  name: z.string().optional().nullable(),
  is_paid: z.union([z.literal(0), z.literal(1)]).optional(),
  price: z.string().optional().nullable(),
  pub_date: z.string().optional().nullable(),
  delay_pub_date: z.string().optional(),
  publisher: z.array(z.number()).optional(),
  content: z.string().optional(),
});

export type EditNovelFormFieldsSchema = z.infer<typeof EditNovelFormFieldsValidator>;

export const EditMangaFormFieldsValidator = z.object({
  tome: z.number().optional(),
  chapter: z.string().optional(),
  name: z.string().optional().nullable(),
  is_paid: z.union([z.literal(0), z.literal(1)]).optional(),
  price: z.string().optional().nullable(),
  pub_date: z.string().optional().nullable(),
  delay_pub_date: z.string().optional(),
  publisher: z.array(z.number()).optional(),
  file: z.instanceof(File).optional(),
});

export type EditMangaFormFieldsSchema = z.infer<typeof EditMangaFormFieldsValidator>;

export const AddNovelFormValidator = z.object({
  value: z.record(
    z.string(),
    z.object({
      id: z.string(),
      fields: AddNovelFormFieldsValidator,
    })
  ),
});

export type AddNovelFormSchema = z.infer<typeof AddNovelFormValidator>;

export const AddMangaFormValidator = z.object({
  value: z.record(
    z.string(),
    z.object({
      id: z.string(),
      fields: AddMangaFormFieldsValidator,
    })
  ),
});

export type AddMangaFormSchema = z.infer<typeof AddMangaFormValidator>;

export const EditNovelFormValidator = EditNovelFormFieldsValidator;

export type EditNovelFormSchema = z.infer<typeof EditNovelFormValidator>;

export const EditMangaFormValidator = EditMangaFormFieldsValidator;

export type EditMangaFormSchema = z.infer<typeof EditMangaFormValidator>;
