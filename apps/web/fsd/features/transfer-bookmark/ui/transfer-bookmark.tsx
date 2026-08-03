import { Button } from '@re/ui-kit/ui/button';

import { useTransferBookmarks } from '~entities/user/model/mutations';
import type { TransferBookmarksSchema } from '~features/transfer-bookmark/model/validators';
import { TransferBookmarksValidator } from '~features/transfer-bookmark/model/validators';
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

export const TransferBookmark = () => {
  const form = useForm({
    schema: TransferBookmarksValidator,
  });
  const { mutateAsync } = useTransferBookmarks();

  const resolveErrors = useErrorHandler({ form });

  const onSubmit = async (values: TransferBookmarksSchema) => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({ profile_link: values.readmanga_link });
      toast.success('Процесс переноса запущен, как только он закончится — мы отправим уведомление');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="readmanga_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на grouple (readmanga)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Указывайте ссылку на свой профиль, например: https://grouple.com/1234567
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button type="submit">Начать перенос</Button>
        </div>
      </form>
    </Form>
  );
};
