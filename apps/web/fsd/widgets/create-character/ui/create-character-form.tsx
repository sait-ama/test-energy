'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';

import { useCreateCharacter } from '~entities/character/model/mutation';
import { CharacterFormBase } from '~features/character-form/ui/character-form';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import type { CreateCharacterFormSchema } from '~widgets/create-character/model/validators';
import { CreateCharacterFormValidator } from '~widgets/create-character/model/validators';

export const CreateCharacterForm = () => {
  const form = useForm({
    schema: CreateCharacterFormValidator,
    defaultValues: {
      data: {
        name: '',
        alt_name: '',
        cover: '',
        description: '',
        details: {},
        titles: [],
      },
    },
  });

  const { mutateAsync } = useCreateCharacter();
  const resolveErrors = useErrorHandler({ form });
  const t = useTranslations('character.form');

  const onSubmit = async (formValues: CreateCharacterFormSchema) => {
    const toast = await importToastAsync();

    try {
      const payload = {
        ...formValues,
        data: {
          name: formValues.data.name,
          alt_name: formValues.data.alt_name || '',
          description: formValues.data.description || '',
          cover: formValues.data.cover || '',
          details: formValues.data.details || {},
          titles: formValues.data.titles,
        },
      };

      await mutateAsync(payload);
      toast.success(t('success_messages.request_sent_moderation'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (e) => logger.error(e, { scope: ['local'] }))}
        className="flex flex-col gap-2"
      >
        <CharacterFormBase />
        <Button type="submit" className="flex self-end">
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
};
