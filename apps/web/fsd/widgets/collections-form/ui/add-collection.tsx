'use client';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import type { CollectionFormSchema } from '~features/(collections)/model/validators';
import { CollectionValidator } from '~features/(collections)/model/validators';
import { CollectionItems } from '~features/(collections)/ui/add-collection-form/collection-items';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsCreateMutation } from '~shared/api/generated/tanstack';
import { SearchField } from '~shared/api/models/search';
import { Routing } from '~shared/config/routing';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const AddCollection = () => {
  const form = useForm({ schema: CollectionValidator });
  const { mutateAsync, isPending } = useMutation(v2TitlesCollectionsCreateMutation({ client }));
  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);
  const resolveErrors = useErrorHandler({ form });
  const checkLogged = useLoggedCheck();
  const router = useRouter();
  const t = useTranslations('pages.collections.collection-add');

  useBeforeUnloadAlert(haveUnsavedChanges);

  const onSubmit = checkLogged(async (data: CollectionFormSchema) => {
    const toast = await importToastAsync();

    try {
      const collection = await mutateAsync({
        body: {
          ...data,
          titles: data.titles.map((v, i) => ({ title: v.id, pos: i })),
        },
      });

      toast.success('submit');
      if (collection?.id) {
        router.push(Routing.Collection.getByID({ params: { id: collection?.id } }));
      }
    } catch (e) {
      await resolveErrors(e);
      logger.error(e);
    }
  });
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit, (e: unknown) =>
          logger.error(e, { scope: ['local'] })
        )}
      >
        <ReText size="2xl" weight="semibold">
          {t('meta.title')}
        </ReText>
        <CollectionItems type={SearchField.titles} />
        <Button type="submit" className="self-start" disabled={!canSave || isPending}>
          {t('trigger')}
        </Button>
      </form>
    </Form>
  );
};
