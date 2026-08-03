import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useParams } from 'next/navigation';

import { z } from 'zod';

import { useTitleDetail } from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import { TitleFormCreators } from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { isFieldChanged } from '~shared/lib/form/is-field-changed';
import { logger } from '~shared/lib/logger';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { TitleEditFormTabBaseProps } from '~widgets/edit-title-form/model/types';
import { CreatorsValidator } from '~widgets/edit-title-form/model/validators';

export const CreatorsTab = ({ children }: TitleEditFormTabBaseProps) => {
  const dir = useParams<{ dir: string }>()?.dir;

  const { data: title } = useTitleDetail({ variables: { params: { dir } } });
  const creatorsData = title?.creators;
  const form = useForm({
    schema: CreatorsValidator,
    mode: 'onChange',
    defaultValues: {
      creators: {
        creators: creatorsData?.map?.((it) => it.id!),
      },
    },
  });
  const {
    formState: { dirtyFields },
    getValues,
  } = form;
  const errorTransformer = useErrorTransformer({ form });
  const [isLoading, setIsLoading] = useState(false);
  const canSubmit = getValues('creators') && isFieldChanged(dirtyFields.creators);
  const onSubmit: SubmitHandler<z.infer<typeof CreatorsValidator>> = async (values) => {
    setIsLoading(true);
    const { creators } = values;
    try {
      if (creators && isFieldChanged(dirtyFields.creators)) {
        const data = {
          request_type: 'add_creators',
          data: {
            creators: creators.creators,
          },
          // @ts-ignore
          user_message: creators.user_message,
        };

        await TitleRepository.update({
          data,
          params: {
            dir,
          },
        });
        setIsLoading(false);
        const toast = await importToastAsync();
        toast.success('Данные отправлены на модерацию');
      }
    } catch (e: unknown) {
      if (isBackendValidationError(e)) {
        errorTransformer(e);
      } else {
        await resolveErrorAsync(e);
      }
      setIsLoading(false);
      logger.error(e);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (e) => console.log({ e }))}>
        <TitleFormCreators defaultValue={{ creators: creatorsData }} />
        {typeof children === 'function'
          ? children?.({ isLoading, disabled: !canSubmit })
          : children}
      </form>
    </Form>
  );
};
