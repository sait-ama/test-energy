import { z } from 'zod';

export const CreateFilterPresetValidator = z.object({
  name: z.string().max(15),
});

export type CreateFilterPresetFormSchema = z.infer<typeof CreateFilterPresetValidator>;
