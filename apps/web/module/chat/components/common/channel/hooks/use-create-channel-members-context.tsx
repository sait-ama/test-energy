import { useEffect, useRef } from 'react';

import { ChannelMemberSchema } from 'module/chat/model/types';

function areMembersEqual(a: ChannelMemberSchema, b: ChannelMemberSchema): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  return a.id === b.id && a.username === b.username && a.role === b.role;
}

function createStore() {
  type Listener = (state: ChannelMemberSchema, prevState: ChannelMemberSchema) => void;
  const listeners: Map<number, Set<Listener>> = new Map();
  let state: Map<number, ChannelMemberSchema> = new Map();
  let lastMembersHash = '';

  const getState = () => state;

  const getMemberById = (userId: number) => state.get(userId);

  const getMembersHash = (members: ChannelMemberSchema[]): string => {
    if (members.length === 0) return '';

    return members
      .map((m) => `${m.id}:${m.username}:${m.role}`)
      .sort()
      .join('|');
  };

  const setState = (newMembers: ChannelMemberSchema[]) => {
    if (newMembers.length === 0 && state.size === 0) {
      return;
    }

    const newHash = getMembersHash(newMembers);
    if (newHash === lastMembersHash) {
      return;
    }

    const newState = new Map();
    const changedMembers = new Set<number>();
    const processedIds = new Set<number>();

    for (const member of newMembers) {
      const userId = member.id;
      processedIds.add(userId);

      const prevMember = state.get(userId);

      if (prevMember && areMembersEqual(prevMember, member)) {
        newState.set(userId, prevMember);
      } else {
        newState.set(userId, member);
        changedMembers.add(userId);
      }
    }

    for (const [userId] of state) {
      if (!processedIds.has(userId)) {
        changedMembers.add(userId);
      }
    }

    if (changedMembers.size === 0) {
      return;
    }

    const oldState = state;
    state = newState;
    lastMembersHash = newHash;

    for (const userId of changedMembers) {
      const userListeners = listeners.get(userId);
      if (userListeners && userListeners.size > 0) {
        const prevMember = oldState.get(userId);
        const newMember = newState.get(userId);

        if (prevMember || newMember) {
          for (const listener of userListeners) {
            if (prevMember && newMember) {
              listener(newMember, prevMember);
            }
          }
        }
      }
    }
  };

  const subscribe = (userId: number) => (listener: Listener) => {
    if (!listeners.has(userId)) {
      listeners.set(userId, new Set());
    }

    const userListeners = listeners.get(userId)!;
    userListeners.add(listener);

    return () => {
      userListeners.delete(listener);
      if (userListeners.size === 0) {
        listeners.delete(userId);
      }
    };
  };

  return {
    getState,
    getMemberById,
    setState,
    subscribe,
  };
}

export type ChannelMembersApi = ReturnType<typeof createStore>;

export const useCreateChannelMembersContext = ({
  members,
}: {
  members: ChannelMemberSchema[];
}): ChannelMembersApi => {
  const storeRef = useRef<ChannelMembersApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  const store = storeRef.current;

  useEffect(() => {
    store?.setState(members);
  }, [members, store]);

  return store;
};
