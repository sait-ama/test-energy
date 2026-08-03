import { createContext } from '@re/core/utils/create-context';

import { ChannelMemberSchema } from '../model/types';

export type ChannelMembersContextValue = {
  getState: () => Map<number, ChannelMemberSchema>;
  getMemberById: (userId: number) => ChannelMemberSchema | undefined;
  setState: (members: ChannelMemberSchema[]) => void;
  subscribe: (
    userId: number
  ) => (listener: (prev: ChannelMemberSchema, next: ChannelMemberSchema) => void) => () => void;
};

export const {
  useStore: useChannelMembersContext,
  Provider: ChannelMembersProvider,
  Context: ChannelMembersContext,
} = createContext<ChannelMembersContextValue, ChannelMembersContextValue>(
  (v) => v,
  'ChannelMembersContext'
);
