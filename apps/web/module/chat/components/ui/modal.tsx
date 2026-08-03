'use client';
import * as React from 'react';
import { RefObject } from 'react';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { DialogPrimitive } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

function Modal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

function ModalPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="modal-content" {...props} />;
}

const ModalOverlay = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & { ref?: RefObject<HTMLDivElement> }) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 p-8',
      className
    )}
    {...props}
  />
);

function ModalContent({
  className,
  children,
  onClose,
  withClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  withClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <ModalPortal data-slot="modal-content">
      <ModalOverlay>
        <DialogPrimitive.Content data-slot="modal-content" className={cn(className)} {...props}>
          <DialogPrimitive.Title className="sr-only">Modal</DialogPrimitive.Title>
          {children}
          <DialogPrimitive.Close
            asChild
            onClick={onClose}
            className="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-[12px] right-[12px] opacity-70 transition-opacity hover:opacity-100 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <Button variant="secondary" circle className="rounded-full">
              <Close className="size-4" />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </ModalOverlay>
    </ModalPortal>
  );
}

export { Modal, ModalContent, ModalOverlay, ModalPortal };
