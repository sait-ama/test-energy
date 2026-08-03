import { lazy, Suspense } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { ButtonProps } from '@re/ui-kit/ui/button';

const OpenChatWithUserContainer = lazy(() =>
  import('module/chat/components/common/user/open-chat-with-user-container').then((m) => ({
    default: m.OpenChatWithUserContainer,
  }))
);

type InnerProps = ButtonProps & {};

const OpenChatWithUserButtonView = (props: InnerProps) => {
  return <Button {...props} />;
};

type SendMessageToUserButton = Omit<InnerProps, 'onClick'> & {
  userId: number;
};

export const SendMessageToUserButton = (props: SendMessageToUserButton) => {
  // @ts-expect-error
  const { onClick: _onClickProp, userId, ...rest } = props;

  return (
    <Suspense fallback={<OpenChatWithUserButtonView {...rest} />}>
      <OpenChatWithUserContainer>
        {({ isCreatingChat, createChat }) => (
          <OpenChatWithUserButtonView
            {...rest}
            disabled={isCreatingChat}
            onClick={() => createChat({ userId })}
          />
        )}
      </OpenChatWithUserContainer>
    </Suspense>
  );
};
