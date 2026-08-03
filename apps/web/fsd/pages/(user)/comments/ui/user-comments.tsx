'use client';

import { useParams } from 'next/navigation';

import { UserComments } from '~widgets/activity';

export const UserCommentsTab = () => {
  const params = useParams();

  return <UserComments target={{ user_id: params.id }} />;
};
