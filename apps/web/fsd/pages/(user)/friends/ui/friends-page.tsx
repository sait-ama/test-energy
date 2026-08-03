import type { PropsWithChildren } from 'react';

import { ReText } from '@re/ui-kit/ui/text';

import { FriendsOrdering } from '~entities/friend/ui/friend-ordering';
import { FriendsList } from '~pages/(user)/friends/ui/friends-list';
import { Underline } from '~shared/ui/underline';

const Container = ({ children }: PropsWithChildren) => (
  <div className="flex w-full flex-col gap-6">{children}</div>
);
const FriendsHeader = () => (
  <Underline>
    <ReText size="xl" component="h2" weight="bold">
      Друзья
    </ReText>
  </Underline>
);

export const Friends = Object.assign(Container, {
  List: FriendsList,
  Header: FriendsHeader,
  Ordering: FriendsOrdering,
});
