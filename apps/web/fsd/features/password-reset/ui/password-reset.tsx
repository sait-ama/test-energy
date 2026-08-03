'use client';

import { Button } from '@re/ui-kit/ui/button';

import { AuthCookiesService } from '~entities/user/model/lib';
import { useChangePassword } from '~entities/user/model/mutations';
import type { PasswordResetSchema } from '~features/password-reset/model/validator';
import { PasswordResetValidator } from '~features/password-reset/model/validator';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const UserProfilePasswordReset = () => {
  const form = useForm({ schema: PasswordResetValidator });
  const { mutateAsync } = useChangePassword();

  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);
  const resolveErrors = useErrorHandler({ form });

  useBeforeUnloadAlert(haveUnsavedChanges);

  const onSubmit = async (body: PasswordResetSchema) => {
    const toast = await importToastAsync();

    try {
      const data = await mutateAsync(body);
      AuthCookiesService.setToken(data.access_token);

      toast.success('Пароль успешно изменен');
    } catch (e: unknown) {
      logger.error(e);

      await resolveErrors(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Старый пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новый пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Придумайте такой пароль, чтобы в нем были заглавные, строчные символы и цифры.
                Минимально — 6 символов.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новый пароль повторно</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!canSave}>
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
};
