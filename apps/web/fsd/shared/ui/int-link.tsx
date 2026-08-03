import type { ComponentProps, FC, ReactNode } from 'react';
import React from 'react';
import Link from 'next/link';

import { cn } from '@re/ui-kit/utils/cn';

import { linkBaseVariants } from '~shared/ui/link-base';

/**
 * @description default:target = _blank, color - var--primary
 */
export const IntLink: FC<
  {
    content: ReactNode | string;
    href: string;
    target?: string;
    color?: string;
    cursor?: string;
  } & Omit<Partial<ComponentProps<typeof Link>>, 'content' | 'href' | 'target' | 'color'>
> = (props) => {
  const {
    content,
    target = '_blank',
    href,
    color = 'var(--primary)',
    as,
    className,
    cursor,
    ...other
  } = props;
  return (
    <Link
      shallow={false}
      prefetch={false}
      as={as}
      href={href}
      target={target}
      style={{ color: color, cursor: cursor }}
      {...other}
      className={cn(linkBaseVariants(), className)}
    >
      {content}
    </Link>
  );
};
