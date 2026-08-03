import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getChapterKey } from '~entities/chapter/model/queries';
import { ChapterQueryKeys } from '~entities/chapter/model/query-keys';
import { getTitleDetailKey } from '~entities/title/model/queries';
import { TitleKeys } from '~entities/title/model/query-keys';
import { ReaderRoot } from '~pages/reader/ui/reader';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getContentType } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { isRussianRegExp } from '~shared/lib/regexp/is-russian';
import { fallbackEmpty as _ } from '~shared/seo/fallback-empty';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string; chapter: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const queryClient = getQueryClient();
    const contentType = getContentType();
    const t = await getTranslations(`pages.reader.meta.${contentType}`);

    const [chapter, title] = await Promise.all([
      queryClient.fetchQuery(
        getChapterKey({
          variables: { params: { chapter: params.chapter } },
          fetchOptions: {
            cache: 'no-cache',
          },
        })
      ),
      queryClient.fetchQuery(
        getTitleDetailKey({
          variables: { params: { dir: params.dir } },
          fetchOptions: {
            cache: 'no-cache',
          },
        })
      ),
    ]);

    return generateNextMetadata({
      title: t('title', {
        tome: chapter.tome,
        chapter: chapter.chapter,
        type: title.type.name,
        main_name: title.main_name,
      }),
      canonical: Routing.Chapter.main({
        params: {
          content: contentType,
          titleDir: title.dir,
          id: chapter.id,
        },
      }),
      description: t('description', {
        tome: chapter.tome,
        chapter: chapter.chapter,
        type: title.type.name,
        main_name: title.main_name,
        description: _(chapter.name),
        another_name: [title.secondary_name, ...title.another_name.split('/')]
          .map((it) => it.trim())
          .sort((a, b) => Number(isRussianRegExp(a)) - Number(isRussianRegExp(b)))
          .join(', '),
      }),
      keywords: t('keywords', {
        main_name: title.main_name,
        type: title.type.name.toLowerCase(),
        another_name: [title.secondary_name, ...title.another_name.split('/')]
          .map((it) => it.trim())
          .sort((a, b) => Number(isRussianRegExp(a)) - Number(isRussianRegExp(b)))
          .join(', '),
        genres: title.genres
          .map((it) =>
            t('tag-keyword', {
              type: title.type.name.toLowerCase(),
              tag_type: 'genre',
              name: it.name.toLowerCase(),
            })
          )
          .join(', '),
        categories: title.categories
          .map((it) =>
            t('tag-keyword', {
              type: title.type.name.toLowerCase(),
              tag_type: 'category',
              name: it.name.toLowerCase(),
            })
          )
          .join(', '),
        tome: chapter.tome,
        chapter: chapter.chapter,
      }),
    });
  }, 'chapter-detailed')
);

export default async function Chapter(
  props: NextPageParams<{ dir: string; chapter: string }, null>
) {
  const [params, cookiesStore] = await Promise.all([props.params, cookies()]);
  const queryClient = getQueryClient();

  if (params.chapter.startsWith('ch')) {
    const contentType = getContentType();

    redirect(
      Routing.Chapter.main({
        params: {
          content: contentType,
          titleDir: params.dir,
          id: params.chapter.slice(2),
        },
      })
    ); //backward comp
  }

  const chapterVariables = {
    params: { chapter: params.chapter },
  };

  const titleVariables = {
    params: { dir: params.dir },
  };

  const [chapter, title] = await Promise.all([
    // eslint-disable-next-line handle-errors/log-error-in-promises
    queryClient.fetchQuery(getChapterKey({ variables: chapterVariables })).catch(() => null),
    // eslint-disable-next-line handle-errors/log-error-in-promises
    queryClient.fetchQuery(getTitleDetailKey({ variables: titleVariables })).catch(() => null),
  ]);

  if (!chapter || !title) {
    notFound();
  }

  if (title && chapter.title_id !== title.id) {
    notFound();
  }

  queryClient.setQueryData(ChapterQueryKeys.detail(chapterVariables), chapter);
  queryClient.setQueryData(TitleKeys.retrieve(titleVariables), title);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReaderRoot defaultValue={cookiesStore.get('reader-settings')?.value ?? ''} />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
