import * as React from 'react';
import { ComponentProps } from 'react';

import ChevronDownIcon from '@re/ui-kit/icons/chevron-down';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

interface TableProps extends ComponentProps<'table'> {
  containerClassName?: string;
}
const Table = ({ ref, className, containerClassName, ...props }: TableProps) => {
  'use no memo';
  return (
    <div className={cn('relative w-full overflow-auto', containerClassName)}>
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
};
Table.displayName = 'Table';

const TableHeader = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement>;
}) => {
  'use no memo';
  return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />;
};
TableHeader.displayName = 'TableHeader';

const TableBody = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement>;
}) => {
  'use no memo';
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
};
TableBody.displayName = 'TableBody';

const TableFooter = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement>;
}) => {
  'use no memo';
  return (
    <tfoot
      ref={ref}
      className={cn('bg-muted/30 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
};
TableFooter.displayName = 'TableFooter';

const TableRow = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.RefObject<HTMLTableRowElement>;
}) => {
  'use no memo';
  return (
    <tr
      ref={ref}
      className={cn(
        'border-border hover:bg-muted/30 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  );
};
TableRow.displayName = 'TableRow';

const TableHead = ({
  ref,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement>;
}) => {
  'use no memo';
  return (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
};
TableHead.displayName = 'TableHead';

const TableCell = ({
  ref,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement>;
}) => {
  'use no memo';
  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
};
TableCell.displayName = 'TableCell';

const TableCaption = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.RefObject<HTMLTableCaptionElement>;
}) => {
  'use no memo';
  return (
    <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  );
};
TableCaption.displayName = 'TableCaption';

export interface TableSortButtonProps extends Omit<ButtonProps, 'onClick'> {
  label: string;
  isSorted: false | 'desc' | 'asc';
  toggleSorting: (desc?: boolean, isMulti?: false | true) => void;
}

const TableSortButton = (props: TableSortButtonProps) => {
  const { variant = 'ghost', label, className, isSorted, toggleSorting, ...rest } = props;
  const isAsc = isSorted === 'asc';

  return (
    <Button
      {...rest}
      variant={variant}
      onClick={() => toggleSorting(isSorted === 'asc')}
      className={cn(className, 'flex items-center gap-2')}
    >
      {label}
      <ChevronDownIcon
        className={cn('transition-transform', {
          'rotate-180': isAsc,
        })}
      />
    </Button>
  );
};

TableSortButton.dispayName = 'TableSortButton';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
};
