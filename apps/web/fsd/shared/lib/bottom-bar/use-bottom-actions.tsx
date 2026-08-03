'use client';
import { cloneElement, ReactElement, useCallback, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';
import { Portal } from '@re/ui-kit/ui/portal';

import { Toaster } from '~shared/ui/toast/toast';

interface Node {
  key: string;
  node: ReactElement;
  index: number;
}

export const { useStore: useBottomActions, Provider: BottomActionsRootProvider } = createContext(
  () => {
    const [value, setValue] = useState<Node[]>([]);

    const register = useCallback((node: Node) => {
      setValue((prev) => {
        const exists = prev.find((a) => a.key === node.key);

        if (exists) {
          return prev.map((a) => (a.key === node.key ? node : a));
        }
        return [...prev, node];
      });
    }, []);

    const unregister = useCallback((key) => {
      setValue((prev) => prev.filter((a) => a.key !== key));
    }, []);

    return {
      value,
      unregister,
      register,
    };
  }
);

export const BottomActionsBase = () => {
  const { value } = useBottomActions();

  return (
    <Portal.Root>
      <div
        className="pointer-events-auto fixed top-[none] bottom-0 left-0 z-[50] flex h-auto w-screen"
        style={{
          marginBottom: 'calc(var(--bottom-bar-height) + env(safe-area-inset-bottom) + 8px)',
        }}
      >
        <Toaster />
        {value
          .sort((a, b) => a.index - b.index)
          .map((it) => cloneElement(it.node, { key: it.key }))}
      </div>
    </Portal.Root>
  );
};
