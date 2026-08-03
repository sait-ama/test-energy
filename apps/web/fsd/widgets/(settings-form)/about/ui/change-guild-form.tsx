'use client';

import { useMemo } from 'react';

import { useRouter } from '@bprogress/next';
import { ClubDetail, ClubUpdateRequest } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';
import pick from 'lodash.pick';

import { useChangeClub } from '~entities/guild/api/mutations';
import { ClubKeys } from '~entities/guild/api/query-keys';
import { useDirDepClub, useGuildQuery } from '~entities/guild/model/hooks';
import { ClubItemForm } from '~features/(guild-manage)/ui/add-guild-form';
import type { ClubCreateUpdateRequestSchema } from '~shared/api/models/guild-club';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { ClubAddFormValidator } from '~widgets/add-guild-form/model/validator';

const dataToRequest = (data: ClubDetail | undefined) => {
  if (!data) return undefined;
  return {
    ...data,
    avatar: data.avatar?.high,
    wallpaper: data?.wallpaper?.high,
  } as ClubCreateUpdateRequestSchema;
};

export const ChangeClubForm = () => {
  'use no memo';

  const dir = useDirDepClub();
  const { data } = useGuildQuery();
  const form = useForm({
    schema: ClubAddFormValidator,
    defaultValues: useMemo(() => dataToRequest(data), [data]),
  });
  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);

  useBeforeUnloadAlert(haveUnsavedChanges);
  const { mutateAsync, isPending, isSuccess } = useChangeClub();

  const checkAuth = useLoggedCheck();
  const errorResolver = useErrorHandler({ form });

  const router = useRouter();

  const handleSubmit = checkAuth(async (values: ClubUpdateRequest) => {
    const toast = await importToastAsync();
    const validated = pick(values, Object.keys(form.formState.dirtyFields));

    try {
      await mutateAsync(validated);
      toast.success('Гильдия изменена');
      router.push(Routing.Club.clubByDir({ params: { dir, tab: 'about' } }), { scroll: true });
      await getQueryClient().setQueryData(ClubKeys.clubsRetrieveQueryKey({ path: { dir } }), (v) =>
        !v ? v : { ...v, ...validated }
      );
    } catch (e: unknown) {
      logger.error(e);

      await errorResolver(e);
    }
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 rounded-md border p-4 md:p-8"
        onSubmit={form.handleSubmit(handleSubmit, (e: unknown) =>
          logger.error(e, { scope: ['local'] })
        )}
      >
        <ClubItemForm />
        <div className="mt-8 flex w-full flex-col justify-end">
          <Button
            disabled={!canSave || isSuccess}
            loading={isPending || form.formState.isSubmitting}
            className="w-full self-end"
            type="submit"
          >
            Применить
          </Button>
        </div>
      </form>
    </Form>
  );
};
