import * as React from 'react';

import { cva } from 'class-variance-authority';

import CheckIcon from '@re/ui-kit/icons/check';
import { Spinner } from '@re/ui-kit/ui/spinner';
import { cn } from '@re/ui-kit/utils/cn';

import type { IconType } from './types';
import { useStepper } from './use-stepper';

interface StepIconProps {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isKeepError?: boolean;
  icon?: IconType;
  index?: number;
  checkIcon?: IconType;
  errorIcon?: IconType;
}

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-4',
      lg: 'size-[30px]',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

const StepIcon = ({
  ref,
  ...props
}: StepIconProps & {
  ref?: React.RefObject<HTMLDivElement>;
}) => {
  const { size } = useStepper();

  const {
    isCompletedStep,
    isCurrentStep,
    isError,
    isLoading,
    isKeepError,
    icon: CustomIcon,
    index,
    checkIcon: CustomCheckIcon,
    errorIcon: CustomErrorIcon,
  } = props;

  const Icon = React.useMemo(() => (CustomIcon ? CustomIcon : null), [CustomIcon]);

  const ErrorIcon = React.useMemo(
    () => (CustomErrorIcon ? CustomErrorIcon : null),
    [CustomErrorIcon]
  );

  const Check = React.useMemo(
    () => (CustomCheckIcon ? CustomCheckIcon : CheckIcon),
    [CustomCheckIcon]
  );

  return React.useMemo(() => {
    if (isCompletedStep) {
      if (isError && isKeepError) {
        return (
          <div className={cn(iconVariants({ size }))} key="icon">
            X
          </div>
        );
      }
      return (
        <div key="check-icon">
          <Check className="size-5" />
        </div>
      );
    }
    if (isCurrentStep) {
      if (isError && ErrorIcon) {
        return (
          <div key="error-icon">
            <ErrorIcon className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      if (isError) {
        return (
          <div className={cn(iconVariants({ size }))} key="icon">
            X
          </div>
        );
      }
      if (isLoading) {
        return <Spinner className={cn(iconVariants({ size }), 'animate-spin')} />;
      }
    }
    if (Icon) {
      return (
        <div key="step-icon">
          <Icon className={cn(iconVariants({ size }))} />
        </div>
      );
    }
    return (
      <span ref={ref} key="label" className={cn('text-md mr-2 text-center font-medium')}>
        {(index || 0) + 1}
      </span>
    );
  }, [
    isCompletedStep,
    isCurrentStep,
    isError,
    isLoading,
    Icon,
    index,
    Check,
    ErrorIcon,
    isKeepError,
    ref,
    size,
  ]);
};

export { StepIcon };
