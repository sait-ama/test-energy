'use client';
import { useMemo } from 'react';

import { useGuildQuery } from '~entities/guild/model/hooks';
import { DataTable } from '~shared/ui/data-table';
import { columns } from '~widgets/(settings-form)/members/model/table';

export const MembersSettingsForm = () => {
  const { data: club } = useGuildQuery();
  const members = useMemo(() => club?.members || [], [club]);
  return <DataTable columns={columns} searchKey="user" data={members} />;
};
