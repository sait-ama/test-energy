import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getChapterKey } from '~entities/chapter/model/queries';
import { ChapterQueryKeys } from '~entities/chapter/model/query-keys';
import { getTitleDetailKey } from '~entities/title/model/queries';
import { TitleKeys } from '~entities/title/model/query-keys';
import { Player } from '~pages/player/ui/player';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  async (
    props: NextPageParams<
      { dir: string },
      {
        episode: string;
      }
    >
  ) => {
    const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
    const queryClient = getQueryClient();
    const t = await getTranslations('pages.reader.meta.series');

    if (!searchParams.episode) {
      notFound();
    } // todo: fix later

    const chapterVariables = {
      params: { chapter: searchParams.episode },
    };

    const titleVariables = {
      params: { dir: params.dir },
    };

    const prefetches = [
      queryClient.fetchQuery(
        getTitleDetailKey({ variables: titleVariables, fetchOptions: { cache: 'no-cache' } })
      ),
    ];

    if (searchParams.episode) {
      prefetches.push(
        queryClient.fetchQuery(
          getChapterKey({ variables: chapterVariables, fetchOptions: { cache: 'no-cache' } })
        )
      );
    }
    const [title, chapter] = await Promise.all(prefetches);

    const seoTitle = t('title', {
      tome: chapter.tome,
      chapter: chapter.chapter,
      type: title.type.name,
      main_name: title.main_name,
    });

    const description = t('description', {
      tome: chapter.tome,
      chapter: chapter.chapter,
      type: title.type.name,
      main_name: title.main_name,
      secondary_name: title.secondary_name,
      another_name: title.another_name,
    });

    return generateNextMetadata({
      title: seoTitle,
      description,
    });
  }
);

export default async function Chapter(props: NextPageParams<{ dir: string }, { episode: string }>) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const queryClient = getQueryClient();

  const chapterVariables = {
    params: { chapter: searchParams.episode },
  };

  const titleVariables = {
    params: { dir: params.dir },
  };

  const prefetches = [
    // eslint-disable-next-line handle-errors/log-error-in-promises
    queryClient.fetchQuery(getTitleDetailKey({ variables: titleVariables })).catch(() => null),
  ];

  if (searchParams.episode) {
    prefetches.push(
      // eslint-disable-next-line handle-errors/log-error-in-promises
      queryClient.fetchQuery(getChapterKey({ variables: chapterVariables })).catch(() => null)
    );
  }

  const [title, chapter] = await Promise.all(prefetches);

  if (chapter && title && chapter.title_id !== title.id) {
    notFound();
  }

  if (chapter) {
    queryClient.setQueryData(ChapterQueryKeys.detail(chapterVariables), chapter);
  }

  if (title) {
    queryClient.setQueryData(TitleKeys.retrieve(titleVariables), title);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container slim className="mt-4 px-2">
        <Player />
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
