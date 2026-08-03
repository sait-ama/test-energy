import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import React, { forwardRef } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export interface RichTextPropsType extends ComponentPropsWithoutRef<'div'> {
  lineClamp?: number;
  children: string;
}

export const RichText = forwardRef<HTMLDivElement, RichTextPropsType>(
  ({ lineClamp, children, className, style, ...other }, ref) => {
    const shortProps = lineClamp
      ? ({
          lineClamp: lineClamp,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          WebkitLineClamp: lineClamp,
        } satisfies CSSProperties)
      : {};

    return (
      <div
        ref={ref}
        style={{
          fontSize: '16px',
          overflowWrap: 'anywhere',
          ...style,
          wordBreak: 'break-word',
          ...shortProps,
        }}
        suppressHydrationWarning
        className={cn('select', className)}
        dangerouslySetInnerHTML={{ __html: children || '' }}
        {...other}
      />
    );
  }
);
