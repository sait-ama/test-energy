'use client';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';

import { useUpdateCreator } from '~entities/creator/model/mutation';
import { useCreatorQuery } from '~entities/creator/model/queries';
import { CreatorForm } from '~features/creator-form/ui/creator-form';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';
import type { EditCreatorFormSchema } from '~widgets/edit-creator/model/validators';
import { EditCreatorFormValidator } from '~widgets/edit-creator/model/validators';

export const EditCreatorForm = () => {
  const params = useParams();
  const { data: creator } = useCreatorQuery({ variables: { params: { id: params.id } } });

  const form = useForm({
    schema: EditCreatorFormValidator,
    defaultValues: {
      data: {
        name: creator?.name ?? '',
        alt_name: creator?.alt_name ?? '',
        cover: creator?.cover ? (UrlFormatter.media(creator.cover.mid) as string) : '',
        description: creator?.description ?? '',
        type: creator?.type?.id ?? 1,
        country: creator?.country.id ?? 1,
      },
    },
  });
  const resolveErrors = useErrorHandler({ form });
  const { mutateAsync } = useUpdateCreator({
    params: {
      creatorId: params.id,
    },
  });

  const onSubmit = async (formValues: EditCreatorFormSchema) => {
    const toast = await importToastAsync();

    try {
      const changedData: Partial<EditCreatorFormSchema['data']> = {};

      Object.keys(form.formState.dirtyFields.data || {}).forEach((key) => {
        //@ts-ignore
        changedData[key] = formValues.data[key];
      });

      const payload = { ...formValues, data: changedData };

      await mutateAsync(payload);
      toast.success('Заявка успешно отправлена на модерацию');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e, (field) => `data.${field}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)} className="flex flex-col">
        <CreatorForm />
        <Button className="mt-5 self-end" type="submit">
          Отправить на модерацию
        </Button>
      </form>
    </Form>
  );
};
