import type { FC } from 'react';
import React, { memo } from 'react';

import './NoMessages.scss';

type OwnProps = {
  chatId: string;
  isGroupChatJustCreated?: boolean;
};

const NoMessages: FC<OwnProps> = () => {
  return (
    <div className="m-auto flex h-full flex-col items-center justify-center">
      <span className="text-muted-foreground text-sm">Ни одного сообщения</span>
    </div>
  );
};

export default memo(NoMessages);
