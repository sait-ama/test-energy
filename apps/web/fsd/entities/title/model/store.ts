'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { useTitleDetail } from '~entities/title/model/queries';
import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';
import { useSession } from '~shared/lib/session/use-session';

export type SelectedIds = number[];

export const { useStore: useTitleEdit, Provider: TitleEditProvider } = createContextSelector(() => {
  const [selectedIds, setSelectedIds] = useState<SelectedIds>([]);

  return { selectedIds, setSelectedIds };
}, 'TitleEditStore');

export const useAvailableBranches = () => {
  const params = useParams<{ dir: string }>();

  const { data } = useTitleDetail({ variables: { params: { dir: params.dir } } });

  const { branches = [] } = data ?? {};
  const user = useSession();

  if (user?.is_staff) {
    return branches;
  }

  const userPublisherIds = user?.publishers?.map((up) => up.id) ?? [];

  return branches?.filter((b) => b.publishers.some((p) => userPublisherIds.includes(p.id)));
};

export const useActiveBranchId = () => {
  const branches = useAvailableBranches();
  const branchIds = branches?.map((it: { id: NumberIsomorphic }) => it.id);

  return useQueryPrimitiveParams({
    fieldName: 'branchId',
    defaultValue: branchIds[0],
    validatingOptions: (v) => branchIds.includes(Number(v)),
  });
};
export type CurrentPageTitleDeps = {
  id: number;
  dir: string;
};
