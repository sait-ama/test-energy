import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';

import { useMomentCreator } from '~entities/reader/model/store';
import { useCreateMoment } from '~entities/title/model/mutations';
import type { MomentFormSchema } from '~features/create-moment-form/model/validator';
import { MomentFormValidator } from '~features/create-moment-form/model/validator';
import { CreateMomentForm } from '~features/create-moment-form/ui/create-moment';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const CreateMomentInReader = () => {
  const momentImage = useMomentCreator((v) => v.url);
  const { chapter: chapterId } = useParams<{ chapter: string }>();
  const session = useSession();
  const setUrl = useMomentCreator((v) => v.setUrl);
  const { data } = useCurrentPageSuspenseTitleDetail();
  const form = useForm({
    schema: MomentFormValidator,
    defaultValues: {
      is_spoiler: false,
      chapter: Number(chapterId),
    },
  });

  const { mutateAsync } = useCreateMoment();

  useEffect(() => {
    form.setValue('image', momentImage);
  }, [momentImage]);

  useEffect(() => {
    form.setValue('title', data?.id);
  }, [data?.id]);

  useEffect(() => {
    form.setValue('author', session?.id);
  }, [session?.id]);

  const closeDialog = () => setUrl('');

  const onSubmit = async (values: MomentFormSchema) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ body: values });
      toast.success('Момент отправен на модерацию');
      closeDialog();
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Dialog open={!!momentImage} onOpenChange={(v) => !v && closeDialog()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Создание момента</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => logger.error(e, { scope: ['local'] }))}
          >
            <CreateMomentForm />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
