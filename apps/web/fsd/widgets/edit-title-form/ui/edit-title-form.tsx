'use client';
import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import { Button } from '@re/ui-kit/ui/button';

import { useContentType } from '~app/providers/site-config-provider';
import {
  useTitleAdditional,
  useTitleDetail,
  useTitleRelations,
} from '~entities/title/model/queries';
import { TitleRepository } from '~entities/title/model/repository';
import {
  ForbiddenFields,
  TitleFormBase,
  TitleFormCreators,
  TitleFormPublishers,
  TitleFormRelations,
} from '~features/title-form/ui/title-form';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useErrorTransformer } from '~shared/lib/form/error-handling-base';
import { isFieldChanged } from '~shared/lib/form/is-field-changed';
import { logger } from '~shared/lib/logger';
import { useLogged } from '~shared/lib/session/use-logged';
import { Container } from '~shared/ui/container';
import { Form, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';
import type { EditTitleSchema } from '~widgets/edit-title-form/model/validators';
import { EditTitleValidator } from '~widgets/edit-title-form/model/validators';

import { ResetSeasonButton } from './reset-season-button';

export const EditTitleForm = () => {
  const params = useParams<{ dir: string }>();
  const isLogged = useLogged();
  const router = useRouter();
  const contentType = useContentType();

  const { data: title } = useTitleDetail({ variables: { params: { dir: params.dir } } });
  const { data: additional } = useTitleAdditional({ variables: { params: { dir: params.dir } } });
  const { data: related } = useTitleRelations(
    { variables: { params: { dir: params.dir } } },
    { throwOnError: false }
  );

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

  const mappedRelated = useMemo(
    () =>
      related?.titles?.map(({ title, type }) => ({
        title,
        id: title?.id,
        type: type.id,
      })) || [],
    [related]
  );

  const publishersData =
    title?.branches.length === 1
      ? title?.branches[0]?.publishers.map((it) => ({
          name: it.name,
          id: it.id,
        }))
      : undefined;

  const creatorsData = title?.creators;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    schema: EditTitleValidator,
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
      },
      publishers: {
        branch_id: title?.branches.length === 1 ? title?.branches[0]?.id : undefined,
        publishers:
          title?.branches.length === 1
            ? title?.branches[0]?.publishers.map((it) => it.id)
            : undefined,
      },
      additional: {
        hasAdditional: !!mappedAdditional.length,
        links: mappedAdditional,
      },
      related: {
        hasRelated: !!mappedRelated.length,
        titles: mappedRelated,
      },
      creators: {
        creators: creatorsData?.map((it) => it.id),
      },
    },
  });

  const errorTransformer = useErrorTransformer({ form });

  const {
    setError,
    formState: { dirtyFields },
  } = form;

  const onSubmit = async (values: EditTitleSchema) => {
    if (!isLogged) {
      return;
    }

    setIsLoading(true);

    let hasError = false;
    const { additional, title, related, publishers, creators } = values;

    if (isFieldChanged(dirtyFields.title)) {
      try {
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
            dir: params.dir,
          },
        });
      } catch (e: unknown) {
        logger.error(e);
        hasError = true;
        errorTransformer(e, (key) => `title.${key}`);
      }
    }

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
            dir: params.dir,
          },
        });
      } catch (e: unknown) {
        logger.error(e);
        hasError = true;
        errorTransformer(e, (key) => `additional.${key}`);
      }
    }

    if (publishers && isFieldChanged(dirtyFields.publishers)) {
      try {
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
            dir: params.dir,
          },
        });
      } catch (e: unknown) {
        hasError = true;
        logger.error(e);
        await resolveErrorAsync(e);
      }
    }

    if (related && isFieldChanged(dirtyFields.related)) {
      const handler = related.hasRelated
        ? TitleRepository.updateRelations
        : TitleRepository.createRelations;

      try {
        let isValid = true;
        if (!related.titles.find((it) => it.title.dir === params.dir)) {
          setError('__error.relations', {
            message: 'Необходимо добавить текущий тайтл к списку связанных произведений',
          });
          hasError = true;
          isValid = false;
        }

        const data = {
          data: {
            titles: related.titles.map((it, index) => ({
              title: it.title.id,
              type: it.type,
              position: index,
            })),
          },
        };

        if (isValid) {
          await handler({
            data,
            params: {
              dir: params.dir,
            },
          });
        }
      } catch (e: unknown) {
        hasError = true;
        logger.error(e);
        await resolveErrorAsync(e);
      }
    }

    if (creators && isFieldChanged(dirtyFields.creators)) {
      try {
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
            dir: params.dir,
          },
        });
      } catch (e: unknown) {
        hasError = true;
        logger.error(e);
        await resolveErrorAsync(e);
      }
    }

    setIsLoading(false);

    if (!hasError) {
      router.push(
        Routing.Title.detail({
          params: {
            dir: params.dir,
            content: contentType,

            tab: 'main',
          },
        })
      );
      const toast = await importToastAsync();
      toast.success('Данные отправлены на модерацию');
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
          <TitleFormPublishers withType defaultValue={{ publishers: publishersData }} />
          <TitleFormRelations defaultValue={{ related: mappedRelated }} />
          <TitleFormCreators defaultValue={{ creators: creatorsData }} />
          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <Button type="submit" disabled={isLoading} className="order-2 md:order-1">
              Отправить на модерацию
            </Button>
            <div className="order-1 flex items-center gap-2 md:order-2">
              <ResetSeasonButton />
              <ForbiddenFields />
            </div>
          </div>
        </form>
      </Form>
    </Container>
  );
};
