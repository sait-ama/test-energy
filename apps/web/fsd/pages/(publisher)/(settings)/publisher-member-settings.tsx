'use client';
import React from 'react';
import { useParams } from 'next/navigation';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import { PublisherMemberDataTableEdit } from '~widgets/(publisher-settings)/members/ui/publisher-member-data-table-edit';

export const PublisherMemberSettings = () => {
  const { dir } = useParams<{ dir: string }>();

  const { data: { content, props: { can_manage_members = false } = {} } = {} } = usePublisherQuery(
    { variables: { params: { dir } } },
    { enabled: !!dir }
  );
  return (
    <PublisherMemberDataTableEdit
      can_manage_members={can_manage_members}
      id={Number(content!.id)}
    />
  );
};
