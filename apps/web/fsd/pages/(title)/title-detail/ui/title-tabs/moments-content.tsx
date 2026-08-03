'use client';

import { useParams } from 'next/navigation';

import { querySuspenseInfiniteOptions } from '@re/api/exports-core';

import { reV2TitlesMomentsListInfiniteOptions } from '~entities/moment/model/queries';
import { useTitleDetail } from '~entities/title/model/queries';
import { MomentsMasonryList } from '~features/(moments)/moments-masonry-list/ui/moment-masonry-list';

export const MomentsContent = () => {
  const { dir } = useParams<{ dir: string }>();
  const { data: title } = useTitleDetail({ variables: { params: { dir } } });

  return (
    <MomentsMasonryList
      options={querySuspenseInfiniteOptions(
        reV2TitlesMomentsListInfiniteOptions({
          api: { query: { title_id: title!.id } },
          suspense: true,
        })
      )}
    />
  );
};
