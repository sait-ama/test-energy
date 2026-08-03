import { ComponentProps } from 'react';
import { ContextProp, GridItemProps } from 'react-virtuoso';

import { cn } from '@re/ui-kit/utils/cn';

import { ShopItemTypes } from '~shared/api/models/shop';

import classes from './classes.module.css';

type ItemWrapperProps = {} & GridItemProps & ContextProp<{ type: ShopItemTypes }>;
export const ItemWrapper = ({ children, className, context, ...props }: ItemWrapperProps) => (
  <div {...props} className={cn('flex w-full', classes.item, className)}>
    {children}
  </div>
);

export const ListWrapper = ({
  style,
  className,
  children,
  ref,
  context,
  ...props
}: ComponentProps<'div'> & { context?: any }) => (
  <div ref={ref} {...props} className={cn('flex flex-wrap gap-[.75rem]', className)} style={style}>
    {children}
  </div>
);
