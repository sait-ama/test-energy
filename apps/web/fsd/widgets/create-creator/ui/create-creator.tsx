'use client';
import { Button } from '@re/ui-kit/ui/button';

import { useCreateCreator } from '~entities/creator/model/mutation';
import { CreatorForm } from '~features/creator-form/ui/creator-form';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import type { CreateCreatorSchema } from '~widgets/create-creator/model/validators';
import { CreateCreatorValidator } from '~widgets/create-creator/model/validators';

export const CreateCreatorForm = () => {
  const form = useForm({
    schema: CreateCreatorValidator,
  });
  const resolveErrors = useErrorHandler({ form });
  const { mutateAsync: createCreator } = useCreateCreator();

  const onSubmit = async (formValues: CreateCreatorSchema) => {
    const toast = await importToastAsync();

    try {
      await createCreator(formValues);
      toast.success('Заявка успешно отправлена на модерацию');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e);
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
