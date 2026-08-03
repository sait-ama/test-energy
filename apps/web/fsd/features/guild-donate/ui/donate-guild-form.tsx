import { ReactNode, useMemo } from 'react';

import type { z } from 'zod';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';

import { useDonateClub } from '~features/guild-donate/model/mutations';
import { getClubDonateValidator } from '~features/guild-donate/model/validators';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';

export const BoostClubForm = ({ actions }: { actions?: ReactNode }) => {
  const { mutateAsync, isPending } = useDonateClub();
  const coins = useSession((v) => v?.coins);
  const validator = useMemo(() => getClubDonateValidator(coins!, 0), [coins]);
  const form = useForm({ schema: validator });
  const resolver = useErrorHandler({ form });

  const onSubmit = async (data: z.infer<typeof validator>) => {
    try {
      await mutateAsync(data);
    } catch (e) {
      logger.error(e);
      await resolver(e);
    }
  };

  return (
    <Form {...form}>
      <form className="flex items-end gap-2" onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <FormField
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="absolute" />
            </FormItem>
          )}
          control={form.control}
          name="coins"
        />
        <Button loading={isPending} type="submit" circle style={{ width: 40, height: 40 }}>
          {isPending ? null : <ExternalLink className="size-4" />}
        </Button>
      </form>

      <div className="flex justify-end">{actions}</div>
    </Form>
  );
};
