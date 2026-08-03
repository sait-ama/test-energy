import { z } from 'zod';

export const PasswordResetValidator = z
  .object({
    old_password: z.string().min(1),
    password: z
      .string()
      .min(6, { message: 'Пароль должен содержать не менее 6 символов' })
      .max(128, { message: 'Пароль должен содержать не более 128 символоов' })
      .regex(/[A-Z]/, { message: 'В пароле должна быть хотя бы одна заглавная буква' })
      .regex(/[0-9]/, { message: 'В пароле должна быть хотя бы одна цифра' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  });

export type PasswordResetSchema = z.infer<typeof PasswordResetValidator>;
