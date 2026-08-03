import { createContext } from '@re/core/utils/create-context';

export type TypingContextType = {
  typing: number[];
};

export const { Provider: TypingProvider, useStore: useTypingStore } = createContext<
  TypingContextType,
  TypingContextType
>((v) => v);
