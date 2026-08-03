'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import pick from 'lodash.pick';

import { Button } from '@re/ui-kit/ui/button';

import { useUpdateCharacter } from '~entities/character/model/mutation';
import { useCharacterQuery } from '~entities/character/model/queries';
import { CharacterFormBase } from '~features/character-form/ui/character-form';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { NArray } from '~shared/utils/NArray';
import { UrlFormatter } from '~shared/utils/url-formatter';
import type { EditCharacterFormSchema } from '~widgets/edit-character/model/validators';
import { EditCharacterFormValidator } from '~widgets/edit-character/model/validators';

export const EditCharacterForm = () => {
  const params = useParams<{ id: string }>();
  const { data } = useCharacterQuery({ variables: { params: { characterId: params.id } } });
  const t = useTranslations('character.form');

  const form = useForm({
    schema: EditCharacterFormValidator,
    defaultValues: {
      data: {
        name: data?.name ?? '',
        alt_name: data?.alt_name ?? '',
        cover: data?.cover ? (UrlFormatter.media(data.cover.mid) as string) : '',
        description: data?.description ?? '',
        details: data?.details ?? {},
        titles: data?.titles?.map((it) => it.id) ?? [],
      },
    },
  });

  const { mutateAsync } = useUpdateCharacter({
    params: { characterId: params.id },
  });

  const resolveErrors = useErrorHandler({ form });

  const onSubmit = async (formValues: EditCharacterFormSchema) => {
    const toast = await importToastAsync();

    const validated = pick(formValues.data, Object.keys(form.formState.dirtyFields['data']));

    try {
      await mutateAsync({ data: validated });
      toast.success(t('success_messages.changes_sent_moderation'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrors(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <CharacterFormBase
          defaultValues={{
            titles: NArray.newBy(data?.titles ?? []).recordBy((it) => it.id),
          }}
        />
        <Button type="submit" className="flex self-end">
          {t('submit')}
        </Button>
      </form>
    </Form>
  );
};
