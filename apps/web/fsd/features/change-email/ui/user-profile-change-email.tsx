'use client';

import { Button } from '@re/ui-kit/ui/button';

import { useUpdateEmail } from '~entities/user/model/mutations';
import type { EmailChangeSchema } from '~features/change-email/model/EmailChangeValidator';
import { EmailChangeValidator } from '~features/change-email/model/EmailChangeValidator';
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

export const UserProfileChangeEmail = () => {
  const form = useForm({ schema: EmailChangeValidator });

  const haveChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);
  const { mutateAsync } = useUpdateEmail();
  const resolveErrors = useErrorHandler({ form });

  useBeforeUnloadAlert(haveChanges);

  const onSubmit = async (data: EmailChangeSchema) => {
    const toast = await importToastAsync();

    try {
      await mutateAsync(data);
      toast.success('Проверьте новую почту. Для завершения смены почты необходимо ее подтвердить');
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Новая почта</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>На нее будут приходить новые письма.</FormDescription>
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
