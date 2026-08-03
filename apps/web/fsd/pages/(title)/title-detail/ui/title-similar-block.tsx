'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { AddSimilarButton } from '~features/add-similar/ui/add-similar';
import { SimilarList } from '~features/similar-list/ui/similar-list';
import { SimilarListSkeleton } from '~features/similar-list/ui/similar-list-skeleton';
import { Routing } from '~shared/config/routing';
import { TestProps } from '~shared/lib/test/utils/test-props';

import { useCurrentPageSuspenseTitleDetail } from '../model/queries';

export interface TitleSimilarBlockProps {
  className?: string;
}

export const TitleSimilarBlock = (props: TitleSimilarBlockProps) => {
  const { className } = props;
  const params = useParams<{ dir: string }>();
  const contentType = useContentType();
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  return (
    <div
      className={cn(
        'bg-secondary flex flex-col gap-3 rounded-md px-4 py-2 dark:bg-transparent dark:p-0',
        // {
        //     ['hidden md:flex']: tab !== TitleDetailPageTabs.MAIN,
        // },
        className
      )}
    >
      <div className="flex items-center justify-between">
        <ReText size="lg" weight="semibold">
          Похожее
        </ReText>
        <Suspense fallback={null}>
          <AddSimilarButton
            size="sm"
            variant="link"
            {...TestProps.id('title-similar-add')}
            targetTitle={title}
          >
            Добавить
          </AddSimilarButton>
        </Suspense>
      </div>
      <div className="flex flex-col gap-3">
        <Suspense fallback={<SimilarListSkeleton />}>
          <SimilarList variables={{ params, query: { count: 5 } }} />
        </Suspense>
        <Button variant="flat" size="sm" asChild>
          <Link
            prefetch={false}
            shallow={false}
            href={Routing.Title.similar({
              params: { content: contentType, dir: title.dir },
            })}
          >
            Больше
          </Link>
        </Button>
      </div>
    </div>
  );
};

export const TitleSimilarBlockSkeleton = (props: TitleSimilarBlockProps) => {
  const { className } = props;

  return (
    <div
      className={cn(
        'bg-secondary flex flex-col gap-3 rounded-md px-4 pb-2 dark:bg-transparent dark:p-0',
        // {
        //     ['hidden md:flex']: tab !== TitleDetailPageTabs.MAIN,
        // },
        className
      )}
    >
      <div className="flex items-center justify-between py-1">
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      <SimilarListSkeleton />
    </div>
  );
};
