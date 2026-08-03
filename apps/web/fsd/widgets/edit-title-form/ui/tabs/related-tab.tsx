import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { z } from 'zod';

import { useTitleRelations } from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import { TitleFormRelations } from '~features/title-form/ui/title-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { logger } from '~shared/lib/logger';
import { useLogged } from '~shared/lib/session/use-logged';
import { isBackendValidationError } from '~shared/types/api.type-guard';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { TitleEditFormTabBaseProps } from '~widgets/edit-title-form/model/types';
import { RelatedValidator } from '~widgets/edit-title-form/model/validators';

export const RelatedTitleEditFormTab = ({ children }: TitleEditFormTabBaseProps) => {
  const dir = useParams<{ dir: string }>()?.dir;
  const { data: related } = useTitleRelations(
    { variables: { params: { dir } } },
    { throwOnError: false }
  );
  const mappedRelated = useMemo(
    () =>
      related?.titles?.map(({ title, type }) => ({
        title,
        id: title?.id,
        type: type.id,
      })) || [],
    [related]
  );
  const form = useForm({
    schema: RelatedValidator,
    defaultValues: {
      related: {
        titles: mappedRelated,
        hasRelated: Boolean(mappedRelated?.length),
      },
    },
  });

  const errorTransformer = useErrorTransformer({ form });
  const [isLoading, setIsLoading] = useState(false);
  const isLogged = useLogged();

  const onSubmit = async (values: z.infer<typeof RelatedValidator>) => {
    setIsLoading(true);
    if (!isLogged) {
      return;
    }
    try {
      const handler = values.related.hasRelated
        ? TitleRepository.updateRelations
        : TitleRepository.createRelations;
      if (!values.related.titles.find((it) => it.title.dir === dir)) {
        form.setError('__error.relations', {
          message: 'Необходимо добавить текущий тайтл к списку связанных произведений',
        });
        return;
      }
      const data = {
        data: {
          titles: values.related.titles.map((it, index) => ({
            title: it.title.id,
            type: it.type,
            position: index,
          })),
        },
      };
      await handler({
        data,
        params: {
          dir,
        },
      });
      const toast = await importToastAsync();
      toast.success('Данные отправлены на модерацию');
    } catch (e: unknown) {
      logger.error(e);
      if (isBackendValidationError(e)) {
        errorTransformer(e);
      } else {
        await resolveErrorAsync(e);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TitleFormRelations />
        {typeof children === 'function' ? children?.({ isLoading, disabled: false }) : children}
      </form>
    </Form>
  );
};
