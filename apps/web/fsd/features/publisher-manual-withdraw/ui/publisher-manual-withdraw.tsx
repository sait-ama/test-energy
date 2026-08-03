import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';

import { useManualWithdraw } from '~entities/publisher/model/mutations';
import { useMoneyAbility } from '~features/(publisher)/withdraw/model/ability';
import type { ManualWithdrawSchema } from '~features/publisher-manual-withdraw/model/validator';
import { ManualWithdrawValidator } from '~features/publisher-manual-withdraw/model/validator';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const PublisherManualWithdrawTrigger = (props: ButtonProps) => (
  <Button color="secondary" {...props}>
    Ручной вывод
  </Button>
);

export const PublisherManualWithdraw = () => {
  const params = useParams<{ dir: string }>();
  const session = useSession()!;
  const ability = useMoneyAbility();
  const { mutateAsync } = useManualWithdraw({ params });
  const t = useTranslations('publisher.actions.manually-withdraw.do');

  const form = useForm({
    schema: ManualWithdrawValidator,
  });
  const canWithdraw = ability.can('create', 'withdraw');
  if (!canWithdraw) return null;
  const onSubmit = async (values: ManualWithdrawSchema) => {
    const toast = await importToastAsync();

    try {
      await mutateAsync(values);
      toast.success('submit');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  if (!session.is_superuser || canWithdraw) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <PublisherManualWithdrawTrigger />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="sum"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t('form-field.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="flex self-end">
              {t('trigger')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
