'use client';

import { Button } from '@re/ui-kit/ui/button';

import { useUpdateCurrentUser } from '~entities/user/model/mutations';
import { preferences } from '~features/change-preference/model/const';
import type { PreferenceSchema } from '~features/change-preference/model/validator';
import { PreferenceValidator } from '~features/change-preference/model/validator';
import { PreferenceCard } from '~features/change-preference/ui/preference-card';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond } from '~shared/lib/form/can-save-cond';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
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
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const UserProfilePreference = () => {
  const session = useSession()!;

  const form = useForm({
    schema: PreferenceValidator,
    defaultValues: {
      preference: session.preference,
    },
  });

  const haveUnsavedChanges = canSaveCond(form);
  const { mutateAsync } = useUpdateCurrentUser();

  useBeforeUnloadAlert(haveUnsavedChanges);

  const onSubmit = async (data: PreferenceSchema) => {
    const toast = await importToastAsync();

    try {
      await mutateAsync(data);
      toast.success('Предпочтения успешно изменены');
    } catch (e: unknown) {
      logger.error(e);

      toast.error('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="preference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Предпочтение</FormLabel>
              <FormDescription>Влияет на выдачу произведений на главной</FormDescription>
              <FormControl>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {preferences.map((it) => (
                    <PreferenceCard
                      className="col-span-2 first:col-span-2 md:col-span-1"
                      key={it.preference}
                      isSelected={it.preference === field.value}
                      onChange={field.onChange}
                      model={it}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!haveUnsavedChanges}>
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
};
