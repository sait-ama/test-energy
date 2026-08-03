'use client';
import React, { ComponentPropsWithoutRef, ReactNode, useMemo } from 'react';

import parse from 'html-react-parser';

import { cn } from '@re/ui-kit/utils/cn';

import { decodeHtml } from '~shared/utils/decode-html';

export interface RichTextExtendedProps extends ComponentPropsWithoutRef<'div'> {
  children: string;
  renderNode?: (attrs: Record<string, string>) => ReactNode;
}

export interface RichTextExtendedProps extends ComponentPropsWithoutRef<'div'> {
  children: string;
  renderNode?: (attrs: Record<string, string>) => ReactNode;
}

export const RichTextExtended = ({
  children,
  className,
  renderNode,
  ...rest
}: RichTextExtendedProps) => {
  const content = useMemo(() => {
    const sanitizedText = decodeHtml(children);
    return parse(sanitizedText, {
      replace: (domNode) => {
        if (renderNode && domNode.type === 'tag' && domNode.name === 'renode') {
          const textNode = domNode.firstChild;
          if (textNode?.type !== 'text') return null;
          try {
            return renderNode(JSON.parse(textNode.data));
          } catch {
            return null;
          }
        }

        return null;
      },
    });
  }, [children]);

  return (
    <div suppressHydrationWarning className={cn('select', className)} {...rest}>
      {content}
    </div>
  );
};
