import { z } from 'zod';

export const CharacterFormValidator = z.object({
  name: z.string().min(1),
  alt_name: z.string().optional(),
  description: z.string().optional(),
  titles: z.array(z.number()).refine((v) => !!v.length, { message: `Обязательное поле` }),
  cover: z.string(),
  details: z.object({
    power: z.string().optional(),
    sex: z.string().optional(),
    classification: z.string().optional(),
    affiliation: z.string().optional(),
    age: z.string().optional(),
    skills: z.string().optional(),
  }),
});
