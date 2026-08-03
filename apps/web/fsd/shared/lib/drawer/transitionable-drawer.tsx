'use client';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { Transition } from '~shared/ui/transition_unstable';

const ANIMATION_DURATION = 225;

interface TransitionableDrawerProps {
  open: boolean;
  onClose: () => void;
  onCloseAnimationFinished: () => void;
  overrideOverflow?: 'hidden' | 'auto' | 'visible';
  header: ReactNode;
}

export const TransitionableDrawer = (props: PropsWithChildren<TransitionableDrawerProps>) => {
  const { open, onClose, onCloseAnimationFinished, header, children, overrideOverflow } = props;
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(open);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = overrideOverflow ?? 'auto';
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (wasOpenRef.current && !open) {
      timeoutRef.current = setTimeout(() => {
        onCloseAnimationFinished();
        timeoutRef.current = null;
      }, ANIMATION_DURATION);
    }

    wasOpenRef.current = open;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [open, onCloseAnimationFinished]);

  return createPortal(
    <div
      ref={drawerRef}
      className={cn(
        'bg-background-content dark:border-border/30 fixed top-0 right-0 flex h-full max-w-full transform flex-col md:pt-[var(--header-height)] dark:border-x',
        //backdrop-blur
        'z-[1000] md:z-[3]',
        'transition-all duration-225 ease-in-out',
        'md:translate-x-0',
        'w-full md:w-[var(--reader-aside-width)]',
        'h-full md:top-0 md:h-full',
        open
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -z-10 translate-y-100 opacity-0 md:!translate-y-0',
        open ? 'right-0 md:right-[calc(var(--reader-aside-toolbar-width))]' : 'top-2 right-0'
      )}
    >
      <div className="flex items-center justify-between gap-1 py-2 pr-3 pl-4">
        <Transition name="fade" slideClassName="flex items-center">
          {header}
        </Transition>
        <Button color="secondary" circle onClick={onClose} variant="flat">
          <Close className="size-4" />
        </Button>
      </div>
      <Transition name="fade" slideClassName="overflow-y-auto px-3 py-2">
        {children}
      </Transition>
    </div>,
    document.body
  );
};
