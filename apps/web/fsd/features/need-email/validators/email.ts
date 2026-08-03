import { z } from 'zod';

export const SetEmailValidator = z.object({
  email: z.string().email(),
});
