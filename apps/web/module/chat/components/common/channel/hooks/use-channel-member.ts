'use client';
import { useSyncExternalStore } from 'react';

import { useChannelMembersContext } from 'module/chat/context/channel-members-context';

export const useChannelMemberById = (userId: number) => {
  const store = useChannelMembersContext();

  const subscribe = store.subscribe(userId);

  return useSyncExternalStore(subscribe, () => store.getMemberById(userId));
};
