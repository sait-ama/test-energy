import * as React from 'react';

export type ContainerRect = {
  width: number;
  height: number;
};

export const useContainerRect = () => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const [containerRect, setContainerRect] = React.useState<ContainerRect>();
  const [isInitialized, setIsInitialized] = React.useState(false);

  const updateContainerRect = React.useCallback(() => {
    const node = containerRef.current;
    if (node) {
      const styles = window.getComputedStyle(node);
      const parse = (value: string) => parseFloat(value) || 0;

      setContainerRect({
        width: Math.round(
          node.clientWidth - parse(styles.paddingLeft) - parse(styles.paddingRight)
        ),
        height: Math.round(
          node.clientHeight - parse(styles.paddingTop) - parse(styles.paddingBottom)
        ),
      });
    } else {
      setContainerRect(undefined);
    }
  }, []);

  const setContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (node) {
        requestAnimationFrame(() => {
          updateContainerRect();
          setIsInitialized(true);

          if (typeof ResizeObserver !== 'undefined') {
            observerRef.current = new ResizeObserver(updateContainerRect);
            observerRef.current.observe(node);
          }
        });
      } else {
        setContainerRect(undefined);
        setIsInitialized(false);
      }
    },
    [updateContainerRect]
  );

  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return {
    containerRef,
    setContainerRef,
    containerRect,
    isInitialized,
  };
};
