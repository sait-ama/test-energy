'use client';

import { getConfiguration } from '~pages/(user)/top/model/const';
import { UserTopItem } from '~pages/(user)/top/user-top-detailed';

export const UserTopDetailedPage = ({ tab }: { tab: UserTopOrdering }) => {
  return <UserTopItem withPagination {...getConfiguration(tab)} />;
};
