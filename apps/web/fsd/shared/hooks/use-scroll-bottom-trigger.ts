import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

interface UseScrollBottomTrigger {
  fn: () => void;
  containerRef: MutableRefObject<HTMLElement>;
  canTrigger: boolean;
}

export const useScrollBottomTrigger = (options: UseScrollBottomTrigger) => {
  const { fn, containerRef, canTrigger } = options;
  const isFirstRun = useRef(true);

  const detectScrollAtBottom = useCallback((callback?: () => void, margin = 100) => {
    if (
      containerRef.current &&
      window.scrollY + window.innerHeight > containerRef.current.clientHeight - margin
    ) {
      if (callback) callback();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!canTrigger || !fn) return;

    const connectedCallback = () => detectScrollAtBottom(fn);

    if (isFirstRun.current) {
      isFirstRun.current = false;
      detectScrollAtBottom();
    }

    window.addEventListener('scroll', connectedCallback);
    return () => {
      window.removeEventListener('scroll', connectedCallback);
    };
  }, [fn, canTrigger]);

  return { detectScrollAtBottom };
};
