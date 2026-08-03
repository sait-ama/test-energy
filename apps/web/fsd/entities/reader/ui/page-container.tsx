import { ForwardedRef, ReactNode, useRef } from 'react';
import React, { forwardRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { useMergeRefs } from 'use-callback-ref';

interface PageContainerProps {
  onView: () => void;
  onViewLeave: () => void;
  initialInView?: boolean;
  children: ReactNode;
}

export const PageContainer = forwardRef(
  (props: PageContainerProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { onView, onViewLeave, children } = props;
    const isFirstRenderRef = useRef(true);
    const [inViewRef] = useInView({
      onChange: (inView) => {
        if (inView) {
          onView();
          return;
        }
        if (isFirstRenderRef.current) {
          isFirstRenderRef.current = false;
          return;
        }
        onViewLeave();
      },
    });

    const combinedRef = useMergeRefs([inViewRef, ref]);

    return <div ref={combinedRef}>{children}</div>;
  }
);
