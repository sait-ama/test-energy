'use client';
import { useLinkStatus } from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRouter } from '@bprogress/next';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import type { z } from 'zod';

import { CollectionValidator } from '~features/(collections)/model/validators';
import { CollectionItems } from '~features/(collections)/ui/add-collection-form/collection-items';
import { client } from '~shared/api/client';
import {
  v2TitlesCollectionsRetrieveOptions,
  v2TitlesCollectionsUpdateMutation,
} from '~shared/api/generated/tanstack';
import { SearchField } from '~shared/api/models/search';
import { Routing } from '~shared/config/routing';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const UpdateCollection = () => {
  const isLinking = useLinkStatus().pending;
  const { id: collectionId } = useParams() as { id: string };
  const { data: collection } = useSuspenseQuery(
    v2TitlesCollectionsRetrieveOptions({
      client,
      path: { id: +collectionId },
    })
  );
  const form = useForm({
    schema: CollectionValidator,
    // @ts-ignore
    defaultValues: {
      ...collection,
      titles: collection.titles.map((v, pos) => ({ ...v, title: v.id, pos })),
    },
  });

  const { mutateAsync, isPending } = useMutation(v2TitlesCollectionsUpdateMutation({ client }));
  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);
  const resolveErrors = useErrorHandler({ form });
  const checked = useLoggedCheck();
  const t = useTranslations('pages.collections.collections-edit');

  useBeforeUnloadAlert(haveUnsavedChanges);
  const router = useRouter();

  const onSubmit = checked(async (data: z.infer<typeof CollectionValidator>) => {
    try {
      const [toast] = await Promise.all([
        importToastAsync(),
        mutateAsync({
          body: {
            ...data,
            titles: data.titles.map((v, i) => ({ title: v.id, pos: i })),
          },
          path: { id: +collectionId },
        }),
      ]);
      router.push(Routing.Collection.getByID({ params: { id: collectionId } }));
      toast.success(t('submit'));
    } catch (e) {
      await resolveErrors(e);
      logger.error(e);
    }
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, (e) => logger.error(e, { scope: ['local'] }))}
      >
        <ReText component="h1" size="2xl">
          {t('meta.title', { name: collection.name, id: collection.id })}
        </ReText>
        <CollectionItems type={SearchField.titles} />
        <Button loading={isLinking} type="submit" disabled={!canSave || isPending}>
          {t('trigger')}
        </Button>
      </form>
    </Form>
  );
};
