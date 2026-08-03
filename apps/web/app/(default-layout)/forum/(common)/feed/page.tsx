import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { TabsContent } from '@re/ui-kit/ui/tabs';

import { getServerStateFromCookieStore } from '~entities/post/model/actions';
import { ForumTagsProvider } from '~entities/post/model/contexts';
import { createForumTagsStore } from '~entities/post/model/store';
import { PostSkeletons } from '~entities/post/ui/post-skeletons-list';
import { Ordering } from '~features/(post)/filters/ui/ordering';
import { TagsFilter } from '~features/(post)/filters/ui/tags-filter';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { PostListPreview } from '~widgets/post/(forum)/(post)/post-list-preview';
import { Tops } from '~widgets/post/tops';

import { ForumJsonLdAsync } from './_json-ld';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const config = getSiteConfig()!;
    const t = await getTranslations(`pages.forum.meta.${config.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: config.site.name }),
      canonical: Routing.Forum.Feed.get({ query: {} }),
    });
  }, 'post-list')
);

export default async function FeedPage({
  searchParams,
}: NextPageParams<never, { search?: string; ordering?: string; title?: string }>) {
  const [searchRecord, initialState] = await Promise.all([
    searchParams,
    getServerStateFromCookieStore(),
  ]);
  const { search = '', ordering = '-id', title } = searchRecord;
  const store = createForumTagsStore(initialState);
  const { includes = [], excludes = [] } = store.getState();

  return (
    <ForumTagsProvider initialState={{ includes, excludes }}>
      <TabsContent value="feed" className="flex flex-col gap-2 md:mt-0">
        <QuerySuspenseContainer
          fallback={
            <div className="bg-card flex h-10 w-full items-center gap-1 overflow-hidden rounded-md px-2 py-1">
              {new Array(8).fill(null).map((_, key) => (
                <Skeleton key={key} className="h-4 w-8" />
              ))}
            </div>
          }
        >
          <div className="flex w-full items-center gap-2">
            <TagsFilter />
            <Ordering className="!h-10 max-sm:hidden" />
          </div>
        </QuerySuspenseContainer>

        <QuerySuspenseContainer
          fallback={
            <div className="relative flex flex-col gap-3">
              <PostSkeletons />
            </div>
          }
        >
          <PostListPreview />
        </QuerySuspenseContainer>
      </TabsContent>
      <TabsContent value="tops" className="mt-0 max-sm:mt-2">
        <Tops />
      </TabsContent>
      <Suspense fallback="">
        <ForumJsonLdAsync
          titleId={title}
          search={search}
          tags={includes}
          excludeTags={excludes}
          week={false}
          ordering={ordering}
        />
      </Suspense>
    </ForumTagsProvider>
  );
}

export const dynamic = 'force-dynamic';
