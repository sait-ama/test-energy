import { ChatMessage } from '../../../context/channel-state-context';
import { CustomMessageActions } from '../../../context/message-context';

export type CustomMessageActionsListProps = {
  message: ChatMessage;
  customMessageActions?: CustomMessageActions;
};
