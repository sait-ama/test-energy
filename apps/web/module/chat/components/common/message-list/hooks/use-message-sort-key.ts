import { useEffect, useRef, useState } from 'react';

import { ChatMessage } from '../../../../context';

type UseMessageSetKeyParams = {
  messages?: ChatMessage[];
};

export const useMessageSetKey = ({ messages }: UseMessageSetKeyParams) => {
  const [messageSetKey, setMessageSetKey] = useState(+new Date());
  const firstMessageUuid = useRef<string | undefined>(undefined);

  useEffect(() => {
    const continuousSet = messages?.find((message) => message.uuid === firstMessageUuid.current);
    if (!continuousSet) {
      setMessageSetKey(+new Date());
    }
    firstMessageUuid.current = messages?.[0]?.uuid;
  }, [messages]);

  return {
    messageSetKey,
  };
};
