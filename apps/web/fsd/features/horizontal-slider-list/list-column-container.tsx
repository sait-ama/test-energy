import type { HTMLAttributes } from 'react';
import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export const ListColumnContainer = (props: HTMLAttributes<HTMLDivElement>) => {
  const { children } = props;

  return (
    <div
      className={cn(
        'inline-block w-[85vw] snap-start break-words sm:w-2/3 xl:w-1/3',
        props.className
      )}
    >
      {children}
    </div>
  );
};
