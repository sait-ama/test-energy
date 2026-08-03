import { z } from 'zod';

export const ClubDonateValidator = z.object({ coins: z.coerce.number().positive().default(0) });
export const getClubDonateValidator = (max: number, min?: number) =>
  z.object({
    coins: z.coerce
      .number()
      .positive()
      .max(max)
      .min(min || 0)
      .default(0),
  });
