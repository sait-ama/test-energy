import { Dispatch, SetStateAction } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { ChannelSchema } from '../model/types';

export type ChannelListContextValue = {
  /**
   * State representing the array of loaded channels.
   * Channels query is executed by default only by ChannelList component in the SDK.
   */
  channels: ChannelSchema[];
  /**
   * Sets the list of Channel objects to be rendered by ChannelList component.
   */
  setChannels: Dispatch<SetStateAction<ChannelSchema[]>>;
};

export const {
  useStore: useChannelListContext,
  Provider: ChannelListContextProvider,
  Context: ChannelListContext,
} = createContext<ChannelListContextValue, ChannelListContextValue>((v) => v, 'ChannelListContext');
