import React, { ComponentProps } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export const Anchor = ({ children, href }: ComponentProps<'a'>) => {
  const isEmail = href?.startsWith('mailto:');
  const isUrl = href?.startsWith('http');

  if (!href || (!isEmail && !isUrl)) return <>{children}</>;

  return (
    <a
      className={cn({ 'str-chat__message-url-link': isUrl })}
      href={href}
      rel="nofollow noreferrer noopener"
      target="_blank"
    >
      {children}
    </a>
  );
};
