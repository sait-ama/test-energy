'use client';

import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { useTitleBundlesQuery } from '~entities/title/model/queries';
import { TitleEditProvider, useActiveBranchId, useTitleEdit } from '~entities/title/model/store';
import { TitleBundleDeleteButton } from '~features/title-chapter-edit-actions/title-bundle-delete-button';
import { EditTitleBundlesTable } from '~pages/(title)/edit-title/bundles-table/edit-title-bundles-table';

export const TitleBundlesList = () => {
  const { selectedIds, setSelectedIds } = useTitleEdit();
  const { value } = useActiveBranchId();

  const { data: bundlesData = {}, isLoading } = useTitleBundlesQuery({
    variables: { params: { id: +value }, query: { detail: 1 } },
  });

  const selectedBundlesIds = selectedIds.join(',');

  return (
    <>
      <div className="flex justify-end gap-3">
        <TitleBundleDeleteButton disabled={!selectedBundlesIds} selectedIds={selectedBundlesIds} />
      </div>
      {isLoading ? (
        <Skeleton className="h-[80vh] w-full rounded-md" />
      ) : (
        <EditTitleBundlesTable data={bundlesData.content || []} setSelectedRows={setSelectedIds} />
      )}
    </>
  );
};

export const TitleBundlesListRoot = () => (
  <TitleEditProvider>
    <TitleBundlesList />
  </TitleEditProvider>
);
