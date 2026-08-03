import React from 'react';

import Send from '@re/ui-kit/icons/send';
import { cn } from '@re/ui-kit/utils/cn';

import { ChatMessage } from '../../../context/channel-state-context';

export type SendButtonProps = {
  sendMessage: (event: React.BaseSyntheticEvent, customMessageData?: Partial<ChatMessage>) => void;
} & React.ComponentProps<'button'>;

export const SendButton = ({ sendMessage, className, disabled, ...rest }: SendButtonProps) => (
  <button
    aria-label="Send"
    className={cn(
      'bg-primary/50 dark:bg-accent dark:text-background rounded-full p-1.5 transition-all duration-300',
      className,
      {
        'opacity-50': disabled,
        'bg-primary text-white': !disabled,
      }
    )}
    data-testid="send-button"
    disabled={disabled}
    onClick={sendMessage}
    type="button"
    {...rest}
  >
    <Send className="size-5" />
  </button>
);
