import * as React from 'react';

import { Label } from '@re/ui-kit/ui/label';
import { cn } from '@re/ui-kit/utils/cn';

import { Input } from '~shared/ui/input';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FloatingInput = ({
  ref,
  className,
  ...props
}: InputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => <Input placeholder=" " className={cn('peer', className)} ref={ref} {...props} />;
FloatingInput.displayName = 'FloatingInput';

const FloatingLabel = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label> & {
  ref?: React.RefObject<React.ComponentRef<typeof Label>>;
}) => (
  <Label
    className={cn(
      'peer-focus:secondary peer-focus:dark:secondary bg-background/50 dark:bg-background absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
      className
    )}
    ref={ref}
    {...props}
  />
);
FloatingLabel.displayName = 'FloatingLabel';

type FloatingLabelInputProps = InputProps & { label?: string };

const FloatingLabelInput = ({
  ref,
  id,
  label,
  ...props
}: React.PropsWithoutRef<FloatingLabelInputProps> & {
  ref?: React.RefObject<React.ComponentRef<typeof FloatingInput>>;
}) => (
  <div className="relative">
    <FloatingInput ref={ref} id={id} {...props} />
    <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
  </div>
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingInput, FloatingLabel, FloatingLabelInput };
