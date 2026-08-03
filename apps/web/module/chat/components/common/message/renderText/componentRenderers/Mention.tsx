import React, { PropsWithChildren } from 'react';

export type MentionProps = PropsWithChildren<{
  node: {
    mentionedUser: any;
  };
}>;

export const Mention = ({ children, node: { mentionedUser } }: MentionProps) => (
  <span className="str-chat__message-mention" data-user-id={mentionedUser.id}>
    {children}
  </span>
);
