'use client';

import * as React from 'react';

import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from 'input-otp';

import DashIcon from '@re/ui-kit/icons/dash';
import { cn } from '@re/ui-kit/utils/cn';

const InputOtp = ({
  ref,
  className,
  containerClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput> & {
  ref?: React.RefObject<React.ComponentRef<typeof OTPInput>>;
}) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    pattern={REGEXP_ONLY_DIGITS}
    {...props}
  />
);
InputOtp.displayName = 'InputOTP';

const InputOtpGroup = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  ref?: React.RefObject<React.ComponentRef<'div'>>;
}) => (
  <div
    ref={ref}
    className={cn('flex h-10 w-full items-center justify-between gap-2', className)}
    {...props}
  />
);
InputOtpGroup.displayName = 'InputOTPGroup';

const InputOtpSlot = ({ ref, index, className, ...props }) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'border-input bg-secondary relative flex h-full w-full items-center justify-center rounded-full border text-sm shadow-xs transition-all',
        isActive && 'ring-ring z-10 ring-1',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
};
InputOtpSlot.displayName = 'InputOTPSlot';

const InputOtpSeparator = ({
  ref,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  ref?: React.RefObject<React.ComponentRef<'div'>>;
}) => (
  <div ref={ref} role="separator" {...props}>
    <DashIcon />
  </div>
);
InputOtpSeparator.displayName = 'InputOTPSeparator';

export { InputOtp, InputOtpGroup, InputOtpSeparator, InputOtpSlot };
