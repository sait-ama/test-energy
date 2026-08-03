'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { useChaptersListInfinite } from '~entities/chapter/model/queries';
import { useActiveBranchId, useTitleEdit } from '~entities/title/model/store';
import { TitleChapterDeleteButton } from '~features/title-chapter-edit-actions/title-chapter-delete-button';
import { TitleChapterMakeFreeButton } from '~features/title-chapter-edit-actions/title-chapter-makefree-button';
import { getChaptersListTableColumns } from '~pages/(title)/edit-title/chapters-table/chapters-columns';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';

type ChaptersListColumn = 'income' | 'date';
export const EditTitlePublishedChapters = () => {
  const { selectedIds, setSelectedIds } = useTitleEdit();
  const { value: branchId } = useActiveBranchId();

  const searchParams = useSearchParams();

  const {
    data: chaptersData,
    isLoading: isChaptersLoading,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useChaptersListInfinite({
    variables: {
      query: {
        is_published: searchParams.get('tab') === 'unpublished' ? 0 : 1,
        branch_id: branchId!,
        detail: 1,
      },
    },
  });

  const selectedChaptersIds = selectedIds.join(',');

  const combinedResults = useMemo(
    () => chaptersData?.pages?.flatMap((item) => item.results) ?? [],
    [chaptersData]
  );

  const hasPublisherIncome = combinedResults?.some((it) => it.publisher_income !== undefined);

  const tableOptions = (): ChaptersListColumn[] => {
    const opt: ChaptersListColumn[] = [];

    if (hasPublisherIncome) {
      opt.push('income');
    }

    return opt;
  };

  return (
    <>
      <div className="mb-3 flex justify-between gap-3">
        <TitleChapterMakeFreeButton
          disabled={!selectedChaptersIds}
          selectedIds={selectedChaptersIds}
        />
        <TitleChapterDeleteButton
          disabled={!selectedChaptersIds}
          selectedIds={selectedChaptersIds}
        />
      </div>
      {isChaptersLoading ? (
        <Skeleton className="h-[80vh] w-full rounded-md" />
      ) : (
        <VirtualizedDataTable
          isLoading={isFetching || isFetchingNextPage}
          isEmpty={!chaptersData}
          canTrigger={hasNextPage}
          onTrigger={fetchNextPage}
          columns={getChaptersListTableColumns(tableOptions())}
          setSelectedRows={setSelectedIds}
          data={combinedResults || []}
        />
      )}
    </>
  );
};
