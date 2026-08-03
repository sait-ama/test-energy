'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import { useTitleDetail } from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import { TitleFormBase } from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { isFieldChanged } from '~shared/lib/form/is-field-changed';
import { logger } from '~shared/lib/logger';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { Container } from '~shared/ui/container';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { TitleEditFormTabBaseProps } from '~widgets/edit-title-form/model/types';
import type { EditTitleSchema } from '~widgets/edit-title-form/model/validators';
import { EditTitleValidator } from '~widgets/edit-title-form/model/validators';

type MainTitleEditFormTabProps = {} & TitleEditFormTabBaseProps;
export const MainTitleEditFormTab = ({ children }: MainTitleEditFormTabProps) => {
  const { dir } = useParams<{ dir: string }>();

  const { data: title } = useTitleDetail({ variables: { params: { dir } } });
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    schema: EditTitleValidator,
    mode: 'onChange',
    defaultValues: {
      title: {
        main_name: title?.main_name,
        secondary_name: title?.secondary_name,
        another_name: title?.another_name,
        type: title?.type.id,
        cover: title?.cover.mid ? (UrlFormatter.media(title?.cover.mid) as string) : undefined,
        wallpaper: title?.wallpaper?.high
          ? (UrlFormatter.media(title?.wallpaper.high) as string)
          : undefined,
        issue_year: title?.issue_year,
        description: title?.description,
        status: title?.status.id,
        age_limit: title?.age_limit.id,
        categories: title?.categories.map((it) => Number(it.id)),
        genres: title?.genres.map((it) => Number(it.id)),
        translate_status: title?.translate_status?.id,
        branches: title?.branches,
        forbidden_fields: title?.forbidden_fields,
      },
    },
  });
  const errorTransformer = useErrorTransformer({ form });

  const {
    formState: { dirtyFields },
  } = form;
  const onSubmit = async (values: EditTitleSchema) => {
    setIsLoading(true);
    try {
      const { title } = values;
      if (isFieldChanged(dirtyFields.title)) {
        const data = {
          request_type: 'title_update',
          data: Object.entries(dirtyFields.title ?? {})
            .filter(([, value]) => value)
            .map(([key]) => key)
            .concat(['genres', 'categories'])
            .reduce((acc, key) => {
              //@ts-ignore
              acc[key] = title[key];
              return acc;
            }, {}),
          user_message: title.user_message,
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
      }
      await resolveErrorAsync(e);
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container slim className="mt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (e) => logger.error(e, { scope: ['local'] }))}
          className="w-full space-y-4"
        >
          <TitleFormBase />
          {typeof children === 'function' ? children?.({ isLoading, disabled: false }) : children}
        </form>
      </Form>
    </Container>
  );
};
