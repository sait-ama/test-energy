'use client';
import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';

import { useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { useDestroyClub } from '~features/guild-pass-request/model/mutations';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const ClubDestroyButton = () => {
  const { mutateAsync: destroyClub, isPending } = useDestroyClub();
  const { data: club } = useGuildSuspenseQuery();
  const form = useForm({ schema: z.object({ password: z.string() }) });
  const resolver = useErrorHandler({ form });
  const onSubmit = async (data: { password: string }) => {
    try {
      await destroyClub(data);
      const toast = await importToastAsync();

      if (!club?.delete_status) {
        toast.error('Заявка создана');
      } else if (club?.delete_status === 'ready') {
        toast.error('Гильдия распущена):');
      }
    } catch (e) {
      await resolver(e);
      logger.error(e);
    }
  };

  return (
    <Section className="w-full p-8">
      <SectionTitle className="mb-4 font-bold">
        {club?.delete_status === null
          ? 'Подать заявку на удаление'
          : club?.delete_status === 'created'
            ? '72ч до проспуска гильдии с подтверждением'
            : 'Снова введите пароль, и гильдия будет распущена'}
      </SectionTitle>
      <SectionContent className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль от аккаунта</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={field.onChange} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="password"
            />
            <Button type="submit" loading={isPending} onClick={destroyClub} variant="destructive">
              Продолжить
            </Button>
          </form>
        </Form>
      </SectionContent>
    </Section>
  );
};
