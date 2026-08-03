import type { ComponentProps, FC, ReactNode } from 'react';
import * as React from 'react';

import { cn } from '../utils/cn';

export interface InputProps extends ComponentProps<'input'> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  withFocus?: boolean;
  inputClassName?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const Input: FC<InputProps> = ({
  className,
  inputClassName,
  type,
  withFocus = false,
  startIcon,
  endIcon,
  ref,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-input box-border flex h-10 w-full items-center rounded-full border px-3 py-2 text-sm',
        { 'pl-3': startIcon, 'pr-3': endIcon },
        {
          '': withFocus,
          // 'focus-within:ring-ring ring-offset-background focus-within:ring-offset- focus-within:ring-1': withFocus
        },
        className
      )}
    >
      {startIcon}
      <input
        type={type}
        className={cn(
          'placeholder:text-muted-foreground w-full p-2 text-[16px] focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          inputClassName
        )}
        ref={ref}
        {...props}
      />
      {endIcon}
    </div>
  );
};

Input.displayName = 'Input';

export { Input };
