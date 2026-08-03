'use client';
import { useTranslations } from 'next-intl';

import { useSuspenseQuery } from '@tanstack/react-query';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { CollectionCard } from '~entities/collection/ui/collection-card';
import { CollectionsSliderSkeleton } from '~entities/collection/ui/collections-slider-skeleton';
import { CollectionsSliderRenderer } from '~entities/collection/ui/collections-slider-view-renderer';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsListOptions } from '~shared/api/generated/tanstack';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { SectionContent, SectionTitle } from '~shared/ui/section';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

const CollectionsSkeleton = () => {
  return (
    <>
      <div className="w-full">
        <Skeleton height={22} className="w-1/3" />
      </div>
      <CollectionsSliderSkeleton />
    </>
  );
};

export const CollectionsContent = ({ id }: { id: number }) => {
  const t = useTranslations('pages.title.common.collections');

  const {
    data: { results: data = [] },
  } = useSuspenseQuery(
    v2TitlesCollectionsListOptions({
      client,
      query: {
        count: 10,
        page: 1,
        title_id: id,
      },
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 4 },
    })
  );

  if (!data?.length) return null;

  return (
    <SectionContent className="bg-secondary dark:bg-background/50 flex flex-col gap-4 rounded-md py-4 md:p-4">
      <SectionTitle className="px-4 md:px-0">{t('title')}</SectionTitle>
      <CollectionsSliderRenderer
        className="max-sm:pl-4"
        itemClassName="basis-3/6 sm:basis-[45%] md:basis-[37%] lg:basis-[37%]! "
        data={data}
      >
        {(item) => <CollectionCard key={item.id} withDescription={false} model={item} />}
      </CollectionsSliderRenderer>
    </SectionContent>
  );
};
export const Collections = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  if (!data.count_collections) return null;

  return (
    <QuerySuspenseContainer fallback={<CollectionsSkeleton />}>
      <CollectionsContent id={data.id} />
    </QuerySuspenseContainer>
  );
};
