import type { PropsWithChildren } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { FriendsOrdering } from '~entities/friend/ui/friend-ordering';
import { FriendsRequestsList } from '~pages/(user)/friends-requests-tab/friends-requests-list';

const Container = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('flex w-full flex-col gap-6', className)}>{children}</div>
);

export const FriendsRequests = Object.assign(Container, {
  List: FriendsRequestsList,
  Ordering: FriendsOrdering,
});
