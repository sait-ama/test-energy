import React, { PropsWithChildren } from 'react';

export const Emoji = ({ children }: PropsWithChildren) => (
  <span className="inline-text-emoji" data-testid="inline-text-emoji">
    {children}
  </span>
);
