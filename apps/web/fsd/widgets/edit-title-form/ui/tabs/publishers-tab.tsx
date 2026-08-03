import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useParams } from 'next/navigation';

import { z } from 'zod';

import { useTitleDetail } from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import { TitleFormPublishers } from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { isFieldChanged } from '~shared/lib/form/is-field-changed';
import { logger } from '~shared/lib/logger';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { TitleEditFormTabBaseProps } from '~widgets/edit-title-form/model/types';
import { PublishersValidator } from '~widgets/edit-title-form/model/validators';

export const PublishersFormTab = ({ children }: TitleEditFormTabBaseProps) => {
  const dir = useParams<{ dir: string }>()?.dir;

  const { data: title } = useTitleDetail({ variables: { params: { dir } } });
  const publishersData =
    title?.branches.length === 1
      ? title?.branches[0]?.publishers.map((it) => ({
          name: it.name,
          id: it.id,
        }))
      : undefined;
  const form = useForm({
    schema: PublishersValidator,
    defaultValues: {
      publishers: {
        branch_id: title?.branches.length === 1 ? title?.branches[0]?.id : undefined,
        publishers:
          title?.branches.length === 1
            ? title?.branches[0]?.publishers.map((it) => it.id)
            : undefined,
      },
    },
  });
  const {
    formState: { dirtyFields },
  } = form;
  const errorTransformer = useErrorTransformer({ form });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit: SubmitHandler<z.infer<typeof PublishersValidator>> = async (values) => {
    setIsLoading(true);
    try {
      const { publishers } = values;

      if (publishers && isFieldChanged(dirtyFields.publishers)) {
        const data = {
          request_type: 'publisher_update',
          data: {
            branch: publishers.branch_id,
            publishers: publishers.publishers,
            type: publishers.type,
          },
          // @ts-ignore
          user_message: publishers.user_message,
        };

        await TitleRepository.update({
          data,
          params: {
            dir,
          },
        });
        const toast = await importToastAsync();
        toast.success('Данные отправлены на модерацию');
      }
    } catch (e: unknown) {
      if (isBackendValidationError(e)) {
        errorTransformer(e, (key) => `title.${key}`);
      } else {
        await resolveErrorAsync(e);
      }
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TitleFormPublishers defaultValue={{ publishers: publishersData }} />
        {typeof children === 'function' ? children?.({ isLoading, disabled: false }) : children}
      </form>
    </Form>
  );
};
