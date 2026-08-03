import { ReactNode, Suspense } from 'react';
import { notFound } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import {
  getCurrentPageTitleDetail,
  prefetchCurrentPageTitleDetail,
} from '~pages/(title)/title-detail/model/server';
import { TitleCommentsBlock } from '~pages/(title)/title-detail/ui/title-comments-block';
import { TitleCoverBlock } from '~pages/(title)/title-detail/ui/title-cover-block';
import { TitleHeaderBlock } from '~pages/(title)/title-detail/ui/title-header-block';
import {
  TitleSimilarBlock,
  TitleSimilarBlockSkeleton,
} from '~pages/(title)/title-detail/ui/title-similar-block';
import { TitleSimilarBlockResponsiveContainer } from '~pages/(title)/title-detail/ui/title-similar-block.client';
import { TitleTabsListBlock } from '~pages/(title)/title-detail/ui/title-tabs-list-block';
import { TitleWallpaperBlock } from '~pages/(title)/title-detail/ui/title-wallpaper-block';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { AgeSubmitBoundaryContainer } from '~widgets/age-submit/ui/age-submit-boundary';

import { TitlePageJsonLd } from './_json-ld';

const NotFoundHelper = async ({ dirPromise }: { dirPromise: Promise<string> }) => {
  const title = await getCurrentPageTitleDetail(await dirPromise);

  if (!title) {
    notFound();
  }

  return null;
};

export default async function TitlePageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ dir: string }>;
}) {
  const dirPromise = params.then(({ dir }) => dir);
  const queryClient = prefetchCurrentPageTitleDetail(await dirPromise);

  const title = await getCurrentPageTitleDetail(await dirPromise);

  if (!title) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <TitlePageJsonLd dirPromise={dirPromise} />
      </Suspense>
      <Suspense fallback={null}>
        <TitleWallpaperBlock dirPromise={dirPromise} />
      </Suspense>
      {/* <Suspense fallback={null}>
        <NotFoundHelper dirPromise={dirPromise} />
      </Suspense> */}
      <div
        className={cn(
          'xs:mt-[10vh] relative m-auto mt-[5vh] flex w-full max-w-[1240px] shrink-0 basis-auto flex-col items-start gap-6 p-4 md:mt-[48px] md:flex-row'
        )}
      >
        <TitleCoverBlock className="xs:max-w-[70vw] mx-auto flex w-full max-w-[60vw] shrink-0 basis-3/5 flex-col gap-4 sm:max-w-[320px] sm:basis-1/2 md:sticky md:top-[76px] md:basis-1/3 lg:basis-1/4 xl:basis-1/5" />
        <div className="flex w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden md:gap-4">
          <TitleHeaderBlock className="[grid-area:header]" />
          <div className="flex max-w-full min-w-0 flex-col gap-4 overflow-x-hidden">
            <Suspense fallback={<Skeleton className="h-8 w-40 rounded-md" />}>
              <TitleTabsListBlock />
            </Suspense>
            <div className="w-full max-w-full min-w-0 flex-[1] grid-cols-[1fr_30%] gap-4 overflow-hidden [grid-template-areas:'content_content''similar_similar''comments_comments'] md:grid xl:[grid-template-areas:'content_similar''comments_similar']">
              <div className="mb-2 max-w-full min-w-0 overflow-hidden [grid-area:content]">
                {children}
              </div>
              <TitleSimilarBlockResponsiveContainer className="[grid-area:similar]">
                <Suspense fallback={<TitleSimilarBlockSkeleton />}>
                  <TitleSimilarBlock />
                </Suspense>
              </TitleSimilarBlockResponsiveContainer>
              <Suspense fallback={null}>
                <TitleCommentsBlock
                  className="[grid-area:comments]"
                  {...TestProps.id('title-comments-block')}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <AgeSubmitBoundaryContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
