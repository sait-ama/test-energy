'use client';
import type { HTMLAttributes, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@re/ui-kit/utils/cn';

import { SectionVisibilityContext } from '~features/page-section-visibility/model/context';
import {
  useLayoutGroupShowControl,
  useShownControl,
} from '~features/page-section-visibility/model/hooks';

export const SectionVisibilityContextProvider = ({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef(null);

  const { store } = useShownControl(containerRef);

  return (
    <SectionVisibilityContext.Provider value={store}>
      <div className={cn('w-full', className)} ref={containerRef}>
        {children}
      </div>
    </SectionVisibilityContext.Provider>
  );
};

const InViewFallback = (props: HTMLAttributes<HTMLDivElement> & { whileInView: () => void }) => {
  const { children, whileInView } = props;

  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      whileInView();
    }
  }, [inView]);

  return <div ref={ref}>{children}</div>;
};

interface InViewStateContainerProps {
  children: (props: { inView: boolean; ref: (node?: Element | null) => void }) => ReactNode;
}

export const InViewStateContainer = (props: InViewStateContainerProps) => {
  const { children } = props;
  const [ref, inView] = useInView({
    initialInView: true,
  });

  return children({ inView, ref });
};

interface SectionVisibilityItemProps {
  fallback?: ReactNode;
  defaultShown?: boolean;
  children: (props: { onLoad: () => void; onError: () => void }) => ReactNode;
}

export const SectionVisibilityItem = ({
  children,
  fallback = null,
  defaultShown = false,
}: SectionVisibilityItemProps) => {
  const { shown, setShown, onSuccess, onError } = useLayoutGroupShowControl(defaultShown);

  if (typeof children !== 'function') {
    throw new Error('VisibilityItem requires a children function prop.');
  }

  if (!shown && fallback) {
    return (
      <InViewFallback
        whileInView={() => {
          setShown(true);
        }}
      >
        {fallback}
      </InViewFallback>
    );
  }

  if (!shown) {
    return fallback;
  }

  return children({ onLoad: onSuccess, onError: onError });
};
