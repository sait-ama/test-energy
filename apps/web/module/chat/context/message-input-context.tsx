import { createContext } from '@re/core/utils/create-context';

import type { MessageInputProps } from '../components/common/message-input';
import type {
  MentionsListState,
  MessageInputHookProps,
  MessageInputState,
} from '../components/common/message-input/hooks/use-message-input-state';
import type { TriggerSettings } from '../components/common/message-input/trigger-provider';

export type MessageInputContextValue = MessageInputState &
  MessageInputHookProps &
  Omit<MessageInputProps, 'Input'> & {
    autocompleteTriggers?: TriggerSettings;
  } & MentionsListState;

export const {
  useStore: useMessageInputContext,
  Provider: MessageInputContextProvider,
  Context: MessageInputContext,
} = createContext<MessageInputContextValue, MessageInputContextValue>(
  (v) => v,
  'MessageInputContext'
);
