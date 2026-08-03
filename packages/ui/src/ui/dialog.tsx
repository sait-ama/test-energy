'use client';
import * as React from 'react';
import { RefObject } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import Close from '../icons/close';
import { cn } from '../utils/cn';

import { Button } from './button';

export type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Dialog({ ...props }: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function DialogTrigger({ ...props }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export type DialogPortalProps = React.ComponentProps<typeof DialogPrimitive.Portal>;

function DialogPortal({ ...props }: DialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function DialogClose({ ...props }: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  variant?: 'default' | 'light' | 'transparent' | 'blur';
  ref?: RefObject<HTMLDivElement>;
};

const DialogOverlay = ({ className, ref, variant = 'default', ...props }: DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 overflow-auto',
      variant === 'default' && 'bg-black/80',
      variant === 'light' && 'bg-black/20',
      variant === 'transparent' && 'bg-transparent',
      variant === 'blur' && 'bg-black/80 backdrop-blur-sm',
      className
    )}
    {...props}
  />
);

export type DialogCloseButtonProps = DialogCloseProps & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  position?: 'absolute' | 'unset';
};

function DialogCloseButton({
  onClick,
  position = 'absolute',
  className,
  ...props
}: DialogCloseButtonProps) {
  return (
    <DialogPrimitive.Close
      asChild
      onClick={(e) => {
        // fixes bubbling dialog close on mobile devices
        e.stopPropagation();
        onClick?.(e);
      }}
      {...props}
      className={cn(
        'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none',
        position === 'absolute' &&
          'absolute top-[12px] right-[12px] sm:top-[-13px] sm:right-[-15px]',
        className
      )}
    >
      <Button color="secondary" circle className="rounded-full">
        <Close className="size-4" />
      </Button>
    </DialogPrimitive.Close>
  );
}

export type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  withClose?: boolean;
  onClose?: () => void;
  Overlay?: React.ComponentType<DialogOverlayProps>;
};

function DialogContent({
  className,
  children,
  onClose,
  withClose = true,
  Overlay = DialogOverlay,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <Overlay>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[max(-40vh,-50%)] gap-4 rounded-md border p-6 shadow-lg duration-200 sm:max-w-lg',
            className
          )}
          {...props}
        >
          {children}
          {withClose ? <DialogCloseButton onClick={onClose} /> : null}
        </DialogPrimitive.Content>
      </Overlay>
    </DialogPortal>
  );
}

export type DialogHeaderProps = React.ComponentProps<'div'>;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export type DialogFooterProps = React.ComponentProps<'div'>;

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export { DialogPrimitive };

export {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
