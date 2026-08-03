import { z } from 'zod';

export const SettingsValidator = z.object({
  username: z.string().optional(),
  description: z.string().optional(),
  sex: z.number().optional(),
  adult: z.number().optional(),
  birthday: z.string().optional().nullish(),
  email_not: z.boolean().optional(),
  is_private: z.boolean().optional(),
  app_extended_catalog: z.boolean().optional(),
  avatar: z.string().optional().nullish(),
  wallpaper: z.string().optional().nullish(),
  is_exchanges_enable: z.boolean().optional(),
  is_two_factor_auth: z.boolean().optional(),
  vk_not: z.boolean().optional(),
  tg_not: z.boolean().optional(),
  is_notify_bp_tasks: z.boolean().optional(),
  main_club: z.number().optional().nullish(),
});

export type SettingsSchema = z.infer<typeof SettingsValidator>;
