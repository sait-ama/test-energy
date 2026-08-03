'use client';

import type { FC } from 'react';

import { useRouter } from '@bprogress/next';
import { z } from 'zod';

import Password from '@re/ui-kit/icons/password';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { AuthService } from '~entities/user/model/lib';
import { usePasswordRecovery } from '~entities/user/model/mutations';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const PasswordRecoveryValidator = z
  .object({
    password: z
      .string()
      .min(1, { message: 'Обязательное поле' })
      .min(1, { message: 'Пароль должен быть больше 6 символов' }),
    confirm_password: z.string().min(1, { message: 'Обязательное поле' }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  });

type PasswordRecoverySchema = z.infer<typeof PasswordRecoveryValidator>;

interface PasswordResetFormProps {
  uid: string;
  token: string;
}

export const PasswordRecovery: FC<PasswordResetFormProps> = (props) => {
  const { uid, token } = props;

  const methods = useForm({
    schema: PasswordRecoveryValidator,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { mutateAsync: recoverPassword } = usePasswordRecovery();
  const serverError = errors.root?.server?.message;

  const router = useRouter();

  const onSubmit = async (formData: PasswordRecoverySchema) => {
    const { password, confirm_password } = formData;
    const toast = await importToastAsync();

    try {
      const data = await recoverPassword({ uid, token, password, confirm_password });
      const { access_token, ...user } = data.content;

      await AuthService.login({ token: access_token, user });

      toast.success('Пароль успешно изменен');
      router.push(Routing.Home.main({ query: {} }));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Form {...methods}>
      <form className="flex w-[350px] flex-col gap-5" autoComplete="off">
        <div className="flex flex-col gap-3">
          <ReText size="md" align="center" weight="semibold">
            Восстановление пароля
          </ReText>
          <ReText size="sm" align="center" color="muted-foreground">
            Введите новый пароль для вашего аккаунта
          </ReText>
        </div>
        <div className="flex flex-col gap-3">
          <FormField
            control={control}
            name="password"
            rules={{
              required: 'Обязательно',
              minLength: {
                value: 3,
                message: 'Пароль должен быть больше 6 символов',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={<Password />}
                    placeholder="*Новый пароль"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    startIcon={<Password />}
                    placeholder="*Пароль еще раз"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {serverError ? (
            <ReText size="sm" align="center" color="destructive">
              {serverError}
            </ReText>
          ) : null}
        </div>
        <Button
          size="lg"
          color="primary"
          onClick={handleSubmit(onSubmit, (e: unknown) => logger.error(e, { scope: ['local'] }))}
        >
          Подтвердить
        </Button>
      </form>
    </Form>
  );
};
