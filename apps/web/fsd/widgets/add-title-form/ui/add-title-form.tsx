'use client';

import React, { useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';

import { TitleRepository } from '~entities/title/model/repository';
import {
  ForbiddenFields,
  TitleFormAdditionalLinks,
  TitleFormBase,
  TitleFormPublishers,
} from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Container } from '~shared/ui/container';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import type { CreateTitleSchema } from '~widgets/add-title-form/model/validators';
import { CreateTitleValidator } from '~widgets/add-title-form/model/validators';

export const AddTitleForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    schema: CreateTitleValidator,
    defaultValues: {
      publishers: {
        branch_id: -1,
      },
      additional: {
        hasAdditional: false,
        links: [{ type: 'original_link', value: '' }],
      },
    },
  });

  const onSubmit = async (values: CreateTitleSchema) => {
    setIsLoading(true);

    const { additional, title, publishers } = values;

    const data = {
      data: {
        ...title,
        additional: additional.links.reduce((acc, curr) => {
          acc[curr.type] = curr.value;
          return acc;
        }, {}),
        publishers: publishers.publishers,
      },
      user_message: title.user_message,
    };

    const toast = await importToastAsync();

    try {
      await TitleRepository.create({
        data,
      });

      toast.success('Тайтл успешно добавлен. Ответ модерации придет в уведомления');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container slim className="mt-4 px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (e: unknown) =>
            logger.error(e, { scope: ['local'] })
          )}
          className="w-full space-y-4"
        >
          <TitleFormBase>
            <TitleFormAdditionalLinks />
          </TitleFormBase>
          <TitleFormPublishers />
          <div className="flex flex-col gap-2 md:flex-row md:justify-between">
            <Button type="submit" disabled={isLoading} className="order-2 md:order-1">
              Отправить на модерацию
            </Button>
            <ForbiddenFields className="order-1 md:order-2" />
          </div>
        </form>
      </Form>
    </Container>
  );
};
