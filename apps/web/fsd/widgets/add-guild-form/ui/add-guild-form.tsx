'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from '@bprogress/next';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getV2NextPageParam } from '@re/api/exports-core';
import Activity from '@re/ui-kit/icons/activity';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { clubsCreateMutation } from '~entities/guild/api/mutations';
import { getClubsInfiniteListOptions } from '~entities/guild/api/queries';
import { ActivityFAQ } from '~entities/shop/ui/faq';
import { ClubItemForm } from '~features/(guild-manage)/ui/add-guild-form';
import { client } from '~shared/api/client';
import type { ClubCreateUpdateRequestSchema } from '~shared/api/models/guild-club';
import { Routing } from '~shared/config/routing';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { ClubAddFormValidator } from '~widgets/add-guild-form/model/validator';

export const AddClubForm = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const form = useForm({
    schema: ClubAddFormValidator,
  });

  const [isRedirecting, setIsRedirecting] = useState(false);
  const haveUnsavedChanges = haveChangesCond(form);

  useBeforeUnloadAlert(haveUnsavedChanges);
  const { mutateAsync, isPending } = clubsCreateMutation();
  const checkAuth = useLoggedCheck();
  const errorResolver = useErrorHandler({ form });
  const { data } = useInfiniteQuery({
    ...getClubsInfiniteListOptions({ client, query: { count: 20, page: 1 } }),
    getNextPageParam: getV2NextPageParam,
  });
  const create_cost = data?.pages?.[0]?.meta?.create_cost ?? 0;
  const coins = useSession((v) => v?.coins);
  const router = useRouter();

  const handleSubmit = checkAuth(async (values: ClubCreateUpdateRequestSchema) => {
    if (isPending || isRedirecting) return;

    const toast = await importToastAsync();

    try {
      setIsRedirecting(true);
      const data = await mutateAsync(values);
      toast.success('Гильдия добавлена');
      router.push(Routing.Club.clubByDir({ params: { dir: data.dir, tab: 'about' } }), {
        scroll: false,
      });
    } catch (e: unknown) {
      logger.error(e);
      if (isMountedRef.current) {
        setIsRedirecting(false);
      }
      await errorResolver(e);
    }
  });

  const isLoading = isPending || form.formState.isSubmitting || isRedirecting;
  const notEnoughCoins = coins !== undefined && (coins ?? 0) < (create_cost ?? 0);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(handleSubmit, (e: unknown) =>
          logger.error(e, { scope: ['local'] })
        )}
      >
        <ReText component="h1" size="xl" weight="bold">
          Создание гильдии
        </ReText>
        <span className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            Создать за <b>{create_cost}</b> <Activity />
          </span>
          <ActivityFAQ />
        </span>
        <ClubItemForm />
        <div className="flex w-full flex-col justify-end">
          <Button
            disabled={notEnoughCoins || isLoading}
            loading={isLoading}
            className="w-full"
            type="submit"
          >
            {notEnoughCoins ? (
              <>
                Не хватает {create_cost - coins} <Activity />
              </>
            ) : (
              'Создать гильдию ☯'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
