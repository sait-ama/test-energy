import { createContext } from '@re/core/utils/create-context';

export type VirtualizedMessageListContextValue = {
  scrollToBottom: () => void;
};

export const {
  useStore: useVirtualizedMessageListContext,
  Provider: VirtualizedMessageListContextProvider,
  Context: VirtualizedMessageListContext,
} = createContext<VirtualizedMessageListContextValue, VirtualizedMessageListContextValue>(
  (v) => v,
  'VirtualizedMessageListContext'
);
