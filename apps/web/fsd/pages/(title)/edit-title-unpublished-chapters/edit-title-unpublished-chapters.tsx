'use client';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { useChaptersListInfinite } from '~entities/chapter/model/queries';
import { useActiveBranchId, useTitleEdit } from '~entities/title/model/store';
import { TitleChapterDeleteButton } from '~features/title-chapter-edit-actions/title-chapter-delete-button';
import { TitlePubChapterButton } from '~features/title-chapter-edit-actions/title-pub-chapter-button';
import { getChapterUnpublishedListColumns } from '~pages/(title)/edit-title/unpublished-titles-table/columns';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';

export const EditTitleUnpublishedChapters = () => {
  const { selectedIds, setSelectedIds } = useTitleEdit();
  const { value: branchId } = useActiveBranchId();

  const {
    data: unpublishedData,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useChaptersListInfinite({
    variables: { query: { is_published: 0, branch_id: branchId!, detail: 1 } },
  });

  const selectedUnpublishedIds = selectedIds.join(',');

  return (
    <>
      <div className="mb-3 flex justify-between gap-3">
        <TitlePubChapterButton
          disabled={!selectedUnpublishedIds}
          selectedIds={selectedUnpublishedIds}
        />
        <TitleChapterDeleteButton
          disabled={!selectedUnpublishedIds}
          selectedIds={selectedUnpublishedIds}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-[80vh] w-full rounded-md" />
      ) : (
        <VirtualizedDataTable
          onTrigger={fetchNextPage}
          isLoading={isLoading}
          canTrigger={hasNextPage}
          columns={getChapterUnpublishedListColumns()}
          data={unpublishedData?.pages?.flatMap((it) => it?.results) || []}
          setSelectedRows={setSelectedIds}
        />
      )}
    </>
  );
};
