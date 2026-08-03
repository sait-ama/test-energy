'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import React, { forwardRef, useCallback, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';
import type { Input } from '@re/ui-kit/input';
import { Command as CommandPrimitive } from 'cmdk';

import Check from '../icons/check';
import ChevronDown from '../icons/chevron-down';
import Close from '../icons/close';
import { cn } from '../utils/cn';

import { Badge } from './badge';
import { Command, CommandEmpty, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { ReText } from './text';

type MultiSelectorProps = {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  disabled?: boolean;
  __defaultOpen?: boolean;
} & React.ComponentPropsWithoutRef<'input'>;

interface MultiSelectContextProps {
  value: string[];
  disabled: boolean;
  onValueChange: (value: any) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const { Provider: MultiselectProvider, useStore: useMultiSelect } = createContext<
  MultiSelectContextProps,
  MultiSelectContextProps
>((v) => v);

const MultiSelector = ({
  values: value,
  onValuesChange: onValueChange,
  loop = false,
  className,
  children,
  dir,
  disabled = false,
  __defaultOpen = false,
  ...props
}: MultiSelectorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState<boolean>(__defaultOpen);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const onValueChangeHandler = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        onValueChange(value.filter((item) => item !== val));
      } else {
        onValueChange([...value, val]);
      }
    },
    [value]
  );

  // TODO : change from else if use to switch case statement

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const moveNext = () => {
        const nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex);
      };

      const movePrev = () => {
        const prevIndex = activeIndex - 1;
        setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
      };

      if ((e.key === 'Backspace' || e.key === 'Delete') && value.length > 0) {
        if (inputValue.length === 0) {
          if (activeIndex !== -1 && activeIndex < value.length) {
            onValueChange(value.filter((item) => item !== value[activeIndex]));
            const newIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;
            setActiveIndex(newIndex);
          } else {
            onValueChange(value.filter((item) => item !== value[value.length - 1]));
          }
        }
      } else if (e.key === 'Enter') {
        setOpen(true);
      } else if (e.key === 'Escape') {
        if (activeIndex !== -1) {
          setActiveIndex(-1);
        } else {
          setOpen(false);
        }
      } else if (dir === 'rtl') {
        if (e.key === 'ArrowRight') {
          movePrev();
        } else if (e.key === 'ArrowLeft' && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      } else {
        if (e.key === 'ArrowLeft') {
          movePrev();
        } else if (e.key === 'ArrowRight' && (activeIndex !== -1 || loop)) {
          moveNext();
        }
      }
    },
    [value, inputValue, activeIndex, loop]
  );

  return (
    <MultiselectProvider
      value={{
        disabled,
        value,
        onValueChange: onValueChangeHandler,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
      }}
    >
      <Popover open={disabled ? false : open} onOpenChange={setOpen}>
        <Command
          onKeyDown={handleKeyDown}
          className={cn(
            'flex flex-col overflow-visible rounded-md bg-transparent',
            disabled && 'cursor-not-allowed',
            className
          )}
          dir={dir}
          {...props}
        >
          {children}
        </Command>
      </Popover>
    </MultiselectProvider>
  );
};

interface MultiSelectorTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  labelResolver: Record<number | string, string>;
  maxVisible?: number;
}

const MultiSelectorTrigger = forwardRef<HTMLDivElement, MultiSelectorTriggerProps>((props, ref) => {
  const { className, labelResolver, maxVisible = 2, children, ...rest } = props;
  const value = useMultiSelect((v) => v.value);
  const onValueChange = useMultiSelect((v) => v.onValueChange);
  const activeIndex = useMultiSelect((v) => v.activeIndex);
  const open = useMultiSelect((v) => v.open);
  const disabled = useMultiSelect((v) => v.disabled);

  const handleClick = (e: MouseEvent<HTMLButtonElement>, value: string) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(value);
  };

  return (
    <PopoverTrigger asChild>
      <div
        ref={ref}
        className={cn(
          'border-border bg-secondary flex h-10 flex-wrap gap-1 overflow-hidden rounded-md border p-2',
          className
        )}
        {...rest}
      >
        {value.slice(0, maxVisible).map((item, index) => (
          <Badge
            key={item}
            className={cn(
              'flex items-center gap-1 px-2',
              disabled && 'opacity-50',
              activeIndex === index && 'ring-muted-foreground ring-2'
            )}
            color="secondary"
          >
            <span className="text-xs">{labelResolver[item]}</span>
            <button
              aria-label={`Удалить ${item}`}
              aria-roledescription="button to remove option"
              type="button"
              className={cn(
                'transition transition-colors',
                disabled ? 'cursor-not-allowed' : 'hover:text-destructive'
              )}
              onClick={(e) => {
                if (disabled) return;

                handleClick(e, item);
              }}
            >
              <span className="sr-only">Удалить {item}</span>
              <Close size={16} />
            </button>
          </Badge>
        ))}
        {value.length > maxVisible ? (
          <ReText size="xs" weight="semibold" className="mx-2 flex items-center">
            + {value.length - maxVisible}
          </ReText>
        ) : null}
        {!value.length ? (
          <span className="mx-2 flex flex-1 items-center justify-between">
            {children}
            <ChevronDown
              data-state={open ? 'open' : 'closed'}
              className="relative ml-1 size-4 transition duration-300 data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>
    </PopoverTrigger>
  );
});

MultiSelectorTrigger.displayName = 'MultiSelectorTrigger';

const MultiSelectorInput = forwardRef<
  React.ComponentRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => {
  const setOpen = useMultiSelect((v) => v.setOpen);
  const inputValue = useMultiSelect((v) => v.inputValue);
  const setInputValue = useMultiSelect((v) => v.setInputValue);
  const activeIndex = useMultiSelect((v) => v.activeIndex);
  const setActiveIndex = useMultiSelect((v) => v.setActiveIndex);
  const disabled = useMultiSelect((v) => v.disabled);

  return (
    <CommandPrimitive.Input
      {...props}
      ref={ref}
      disabled={disabled}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onBlur={() => {
        setOpen(false);
      }}
      onFocus={() => {
        setOpen(true);
      }}
      onClick={() => {
        setActiveIndex(-1);
      }}
      className={cn(
        'placeholder:text-muted-foreground m-0 h-full flex-1 bg-transparent p-0 text-sm outline-hidden',
        className,
        activeIndex !== -1 && 'caret-transparent'
      )}
    />
  );
});

MultiSelectorInput.displayName = 'MultiSelectorInput';

const MultiSelectorContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children }, ref) => (
    <PopoverContent
      ref={ref as any}
      className="bg-background w-[var(--radix-popover-trigger-width)]"
    >
      {children}
    </PopoverContent>
  )
);

MultiSelectorContent.displayName = 'MultiSelectorContent';

const MultiSelectorList = forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, children }, ref) => (
  <CommandList
    ref={ref}
    className={cn(
      'flex flex-col gap-1',
      // 'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg absolute top-0 z-10 flex w-full flex-col gap-2 rounded-md border border-muted bg-background p-2 shadow-md transition-colors',
      className
    )}
  >
    {children}
    <CommandEmpty>
      <span className="text-muted-foreground">Ничего не найдено</span>
    </CommandEmpty>
  </CommandList>
));

MultiSelectorList.displayName = 'MultiSelectorList';
//todo resolve ts errors
const MultiSelectorItem = forwardRef<
  React.ComponentRef<'input'>,
  { value: string } & React.ComponentPropsWithoutRef<'input'>
>(({ className, value, children, ...props }, ref) => {
  const values = useMultiSelect((v) => v.value);
  const onValueChange = useMultiSelect((v) => v.onValueChange);
  const setInputValue = useMultiSelect((v) => v.setInputValue);

  const mousePreventDefault = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const isIncluded = values.includes(value);

  return (
    <CommandItem
      ref={ref}
      {...props}
      onSelect={() => {
        onValueChange(value);
        setInputValue('');
      }}
      className={cn(
        'flex cursor-pointer justify-between rounded-md px-2 py-1 transition-colors',
        className,
        isIncluded && 'opacity-50',
        props.disabled && 'cursor-not-allowed opacity-50'
      )}
      onMouseDown={mousePreventDefault}
    >
      {children}
      {isIncluded && <Check size={20} />}
    </CommandItem>
  );
});

MultiSelectorItem.displayName = 'MultiSelectorItem';

export {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
};
