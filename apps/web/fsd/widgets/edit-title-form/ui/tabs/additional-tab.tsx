'use client';
import React, { useMemo, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useParams } from 'next/navigation';

import { z } from 'zod';

import { useTitleAdditional } from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import { TitleFormAdditionalLinks } from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { isFieldChanged } from '~shared/lib/form/is-field-changed';
import { logger } from '~shared/lib/logger';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { Container } from '~shared/ui/container';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { TitleEditFormTabBaseProps } from '~widgets/edit-title-form/model/types';
import { AdditionalValidator } from '~widgets/edit-title-form/model/validators';

type MainTitleEditFormTabProps = {} & TitleEditFormTabBaseProps;
export const TitleAdditionalFormLinksTab = ({ children }: MainTitleEditFormTabProps) => {
  const { dir } = useParams<{ dir: string }>();
  const { data: additional } = useTitleAdditional({ variables: { params: { dir } } });
  const mappedAdditional = useMemo(() => {
    if (!additional) {
      return [];
    }
    return Object.entries(additional!)
      .filter(([key, value]) => !['id', 'title'].includes(key) && value)
      .map(([key, value]) => ({
        type: key,
        value,
      }));
  }, [additional]);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    schema: AdditionalValidator,
    mode: 'onChange',
    defaultValues: {
      additional: {
        hasAdditional: !!mappedAdditional.length,
        links: mappedAdditional,
      },
    },
  });
  const errorTransformer = useErrorTransformer({ form });
  const {
    formState: { dirtyFields },
  } = form;
  const onSubmit: SubmitHandler<z.infer<typeof AdditionalValidator>> = async (values) => {
    setIsLoading(true);
    const { additional } = values;
    if (isFieldChanged(dirtyFields.additional)) {
      const handler = additional.hasAdditional
        ? TitleRepository.updateAdditional
        : TitleRepository.createAdditional;
      try {
        const data = {
          data: additional.links.reduce<Record<string, string>>((acc, curr) => {
            acc[curr.type] = curr.value;
            return acc;
          }, {}),
        };

        await handler({
          data,
          params: {
            dir,
          },
        });
        setIsLoading(false);
        const toast = await importToastAsync();
        toast.success('Данные отправлены на модерацию');
      } catch (e: unknown) {
        logger.error(e);
        if (isBackendValidationError(e)) {
          errorTransformer(e);
        }
        await resolveErrorAsync(e);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container slim className="mt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log({ e });
          })}
          className="w-full space-y-4"
        >
          <TitleFormAdditionalLinks />
          {typeof children === 'function' ? children?.({ isLoading, disabled: false }) : children}
        </form>
      </Form>
    </Container>
  );
};
