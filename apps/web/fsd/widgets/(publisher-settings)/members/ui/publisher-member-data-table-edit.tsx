import React from 'react';

import { AddMemberPreviewTrigger } from '~features/(publisher)/add-member/ui/add-member-preview-trigger';
import { DataTable } from '~shared/ui/data-table';
import { usePublisherMemberColumns } from '~widgets/(publisher-settings)/members/model/member-data-table-columns';
import { useSuspenseQuery } from '@tanstack/react-query';
import { v2PublishersMembersListOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { client } from '~shared/api/client';
import { useParams } from 'next/navigation';

export const PublisherMemberDataTableEdit = ({
  id,
  can_manage_members,
}: {
  id: number;
  can_manage_members?: boolean;
}) => {
  const { dir } = useParams<{ dir: string }>();
  const columns = usePublisherMemberColumns();
  const { data } = useSuspenseQuery(
    v2PublishersMembersListOptions({
      client,
      path: {
        dir,
      },
    })
  );

  return (
    <div className="space-y-4">
      {/*@ts-ignore*/}
      <DataTable withoutHeader columns={columns} data={data} />
      {can_manage_members && <AddMemberPreviewTrigger publisherId={id} />}
    </div>
  );
};
