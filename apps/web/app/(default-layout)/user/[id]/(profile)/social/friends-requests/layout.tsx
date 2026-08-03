import type { PropsWithChildren } from 'react';
import { notFound } from 'next/navigation';

import { FriendsRequests } from '~pages/(user)/friends-requests-tab/friends-requests-page';
import { NextPageParams } from '~shared/types/next';

export default async function Layout({
  children,
  params,
}: PropsWithChildren & NextPageParams<{ id: string }>) {
  const { id } = await params;

  if (!id) notFound();

  return <FriendsRequests>{children}</FriendsRequests>;
}
