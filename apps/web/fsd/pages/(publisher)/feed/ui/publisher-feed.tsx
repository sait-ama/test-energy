'use client';
import React, { lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';

import { getLatestChaptersListSuspenseInfiniteQuery } from '~entities/latest-chapter/model/queries';
import { LatestChapterItem } from '~entities/latest-chapter/ui/latest-chapter-item';
import {
  LatestChaptersList,
  LatestChaptersListContainer,
} from '~entities/latest-chapter/ui/latest-chapters-list';
import { LatestChaptersListSkeleton } from '~entities/latest-chapter/ui/latest-chapters-list-skeleton';
import { usePublisherQuery } from '~entities/publisher/model/queries';
import {
  OnlyMyContextConsumer,
  OnlyMyLatestChapterContextProvider,
  OnlyMyLatestChaptersTrigger,
} from '~features/latest-chapters/ui/only-my-wrapper';
import type { OnlyMy } from '~shared/api/models/latest-chapter';
import { ContentSuspenseInfiniteQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

const OnlyMyLatestChaptersToggle = lazy(() =>
  import(
    /* webpackChunkName: "OnlyMyLatestChaptersToggle" */ '~features/latest-chapters/ui/only-my-wrapper'
  ).then((m) => ({
    default: m.OnlyMyLatestChaptersToggle,
  }))
);

export const PublisherFeed = () => {
  const { dir } = useParams<{ dir: string }>();
  const { data } = usePublisherQuery({ variables: { params: { dir } } });

  const publisher = data!.content;

  const getLatestChaptersInfiniteQuery = (onlyMy: OnlyMy) =>
    getLatestChaptersListSuspenseInfiniteQuery({
      variables: {
        query: {
          publisher: publisher.id,
          bookmarks: onlyMy,
        },
      },
    });

  return (
    <OnlyMyLatestChapterContextProvider>
      <div className="mb-3 flex justify-start">
        <OnlyMyLatestChaptersTrigger>
          {(props) => (
            <Suspense fallback={null}>
              <OnlyMyLatestChaptersToggle {...props} />
            </Suspense>
          )}
        </OnlyMyLatestChaptersTrigger>
      </div>
      <QuerySuspenseContainer
        fallback={
          <LatestChaptersListContainer>
            <LatestChaptersListSkeleton />
          </LatestChaptersListContainer>
        }
      >
        <OnlyMyContextConsumer>
          {({ onlyMy }) => (
            <ContentSuspenseInfiniteQuery queryOptions={getLatestChaptersInfiniteQuery(onlyMy)}>
              {(query) => (
                <LatestChaptersList
                  renderItem={(item, itemProps) => (
                    <LatestChapterItem model={item} {...itemProps} />
                  )}
                  query={query}
                />
              )}
            </ContentSuspenseInfiniteQuery>
          )}
        </OnlyMyContextConsumer>
      </QuerySuspenseContainer>
    </OnlyMyLatestChapterContextProvider>
  );
};
