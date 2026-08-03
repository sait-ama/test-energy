import { z } from 'zod';

export const AuthFormValidator = (t: (message: string, options?: any) => string) =>
  z.object({
    form: z.string(),
    fields: z.object({
      login: z.object({
        user: z.string().min(1, { message: t('Обязательное поле') }),
        password: z.string().min(1, { message: t('Обязательное поле') }),
      }),
      'login-two-factor': z.object({
        'allowed-methods': z
          .object({
            type: z.string(),
            name: z.string(),
          })
          .array(),
        method: z.string().min(1, { message: t('Обязательное поле') }),
        code: z.string().min(1, { message: t('Обязательное поле') }),
      }),
      register: z
        .object({
          username: z.string().min(3, { message: t('Мин длина', { value: 3 }) }),
          email: z
            .string()
            .min(1, { message: t('Обязательное поле') })
            .email(),
          password: z.string().min(1, { message: t('Обязательное поле') }),
          confirm_password: z.string().min(1, { message: t('Обязательное поле') }),
        })
        .refine((data) => data.password === data.confirm_password, {
          message: t('Пароли не совпадают'),
          path: ['confirm_password'],
        }),
      'password-recovery': z.object({
        email: z
          .string()
          .min(1, { message: t('Обязательное поле') })
          .email(),
      }),
    }),
  });

export type AuthFormSchema = z.infer<ReturnType<typeof AuthFormValidator>>;
