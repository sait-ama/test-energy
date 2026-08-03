import type { ComponentProps, ElementType } from 'react';
import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-sm border p-4 border-l-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
  {
    variants: {
      severity: {
        info: 'bg-secondary text-secondary-foreground border-border border-l-border',
        success:
          'bg-success/10 text-success-foreground border-success/30 border-l-success [&>svg]:text-white',
        error:
          'bg-destructive/10 text-foreground border-destructive/30 border-l-destructive [&>svg]:text-white',
      },
    },
    defaultVariants: {
      severity: 'info',
    },
  }
);

interface AlertProps extends ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  component?: ElementType;
}

const Alert = (props: AlertProps) => {
  const { className, severity = 'info', component: Component = 'div', ...rest } = props;

  return (
    <Component
      {...rest}
      role="alert"
      data-slot="alert"
      className={cn(
        alertVariants({
          severity,
          className,
        })
      )}
    />
  );
};

Alert.displayName = 'Alert';

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
