'use client';

import { userSetEmailMutation } from '@re/api/generated/@tanstack/react-query.gen';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { SetEmailValidator } from '~features/need-email/validators/email';
import { client } from '~shared/api/client';
import { useOpen } from '~shared/hooks/use-open';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const NeedEmail = () => {
  const [open, toggle] = useOpen(true);
  const { mutateAsync } = useMutation(userSetEmailMutation({ client }));
  const form = useForm({
    reValidateMode: 'onChange',
    schema: SetEmailValidator,
  });

  const {
    formState: { errors },
  } = form;

  const onSubmit = async (data: z.infer<typeof SetEmailValidator>) => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({ body: data });
      toast.success('Обмен прошел успешно!');
      toggle();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="mt-[-60px] sm:mt-0 sm:max-w-lg">
        <div className="flex flex-col gap-1">
          <DialogTitle className="flex items-center gap-1">
            Пожалуйста, привяжите email к аккаунту
          </DialogTitle>
        </div>

        <ReText size="sm" color="muted-foreground" className="flex">
          Аккаунт создан через соцсеть — у вас нет привязанной почты. Без нее восстановить доступ не
          получится.
        </ReText>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-1 flex flex-col gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      className="col-span-2"
                      placeholder="Введите свою почту"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={!!errors.__error} className="mt-2" type="submit">
              Изменить
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
