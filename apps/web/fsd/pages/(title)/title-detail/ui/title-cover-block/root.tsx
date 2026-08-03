'use client';
import { Suspense } from 'react';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { TitleImage } from '~entities/title/ui/title-image';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';
import { ActionButtons } from './action-buttons';
import { BookmarkButtonTitlePage } from './bookmark-button';
import { ReadButton } from './read-button';

export interface TitleCoverBlockProps {
  className: string;
}

const TitleCoverImage = () => {
  const { data } = useCurrentPageSuspenseTitleDetail();

  return <TitleImage src={data.cover.high} alt={data.main_name ?? ''} priority fill />;
};

const TitleCoverImageFallback = () => {
  return <Skeleton className="aspect-[2/3] w-full overflow-hidden rounded-sm select-none" />;
};

export const TitleCoverBlock = (props: TitleCoverBlockProps) => {
  const { className } = props;

  return (
    <div className={className}>
      <Suspense fallback={<TitleCoverImageFallback />}>
        <TitleCoverImage />
      </Suspense>
      <Media
        greaterThanOrEqual={Display.md}
        className="p-0l z-[100] hidden w-full flex-col justify-between gap-2 md:flex"
      >
        <Suspense fallback={<Skeleton className="h-10 w-full rounded-full" />}>
          <ReadButton className="order-1 flex-[1_0_auto]" />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-10 w-full rounded-full" />}>
          <BookmarkButtonTitlePage />
        </Suspense>
        <Suspense fallback={null}>
          <ActionButtons className="order-3" />
        </Suspense>
      </Media>
    </div>
  );
};
