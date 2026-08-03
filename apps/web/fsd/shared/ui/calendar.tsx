'use client';

import * as React from 'react';
import type { DropdownProps } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';

import dayjs from 'dayjs';

import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import ChevronRight from '@re/ui-kit/icons/chevron-right';
import { buttonVariants } from '@re/ui-kit/ui/button';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { cn } from '@re/ui-kit/utils/cn';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      weekStartsOn={1}
      formatters={{
        formatMonthCaption: (day) => dayjs(day).format('MMMM'),
        formatCaption: (day) => dayjs(day).format('MMMM YYYY'),
        formatWeekdayName: (day) => dayjs(day).format('dd'),
      }}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 ',
        month: 'space-y-4 ',
        caption: 'w-full flex flex-col-reverse gap-2 pt-1 relative',
        caption_label: 'text-sm font-medium absolute top-2 left-[25%]',
        caption_dropdowns: 'w-full flex justify-center gap-1 pt-2',
        nav: 'space-x-1 flex items-center justify-between',
        nav_button: cn(
          buttonVariants({ variant: 'secondary' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex select-none',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        tbody: 'grid grid-rows-6',
        row: 'flex w-full mt-2',
        cell: cn(
          'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent  focus-within:relative focus-within:z-20',
          props.mode === 'single'
            ? '[&:has([aria-selected])]:!rounded-full'
            : 'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50 hover:!bg-secondary !cursor-not-allowed',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, children }: DropdownProps) => {
          const options = React.Children.toArray(children) as React.ReactElement<
            React.HTMLProps<HTMLOptionElement>
          >[];
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="h-[28px] pr-1.5 focus:ring-0">
                <SelectValue>{selected?.props.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                <ScrollArea className="h-80">
                  {options.map((option, id: number) => (
                    <SelectItem
                      key={`${option.props.value}-${id}`}
                      value={option.props.value?.toString() ?? ''}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: ({ ...props }) => <ChevronLeft {...props} />,
        IconRight: ({ ...props }) => <ChevronRight {...props} />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
