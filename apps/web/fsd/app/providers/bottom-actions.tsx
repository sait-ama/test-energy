'use client';

import { cloneElement } from 'react';

import { Portal } from '@re/ui-kit/ui/portal';
import { AnimatePresence } from 'motion/react';

import { useBottomActions } from '~shared/lib/bottom-bar/use-bottom-actions';
import { Toaster } from '~shared/ui/toast/toast';

export const BottomActions = () => {
  const { value } = useBottomActions();

  return (
    <>
      <Toaster id="advertising" style={{ zIndex: 40 }} />
      <Portal.Root>
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-[51] flex h-auto"
          style={{
            marginBottom: 'calc(var(--bottom-bar-height) + env(safe-area-inset-bottom) + 8px)',
          }}
        >
          <Toaster />
          <div className="z-[50] flex">
            <AnimatePresence>
              {value
                .sort((a, b) => a.index - b.index)
                .map((it) => cloneElement(it.node, { key: it.key }))}
            </AnimatePresence>
          </div>
        </div>
      </Portal.Root>
    </>
  );
};
