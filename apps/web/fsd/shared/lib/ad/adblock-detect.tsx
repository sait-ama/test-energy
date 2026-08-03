import { RefObject, useEffect, useState } from 'react';

export const useAdblockDetect = <ElementType extends HTMLElement>(
  ref?: RefObject<ElementType | null | undefined>,
  deps: (string | number | boolean)[] = []
) => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const element = ref?.current;

    const checkIsBlocked = () => {
      if (!element) return true;

      if (!element.children || element.children.length === 0) return true;

      if (element.offsetHeight < 10 || element.offsetWidth < 10) return true;

      const computedStyle = window.getComputedStyle(element);
      if (
        computedStyle.display === 'none' ||
        computedStyle.visibility === 'hidden' ||
        computedStyle.opacity === '0'
      )
        return true;

      const rect = element.getBoundingClientRect();
      if (rect.top < -10000 || rect.left < -10000 || rect.bottom > 10000 || rect.right > 10000)
        return true;

      return false;
    };

    setIsBlocked(checkIsBlocked());

    const timeoutId = setTimeout(() => setIsBlocked(checkIsBlocked()), 300);

    const secondTimeoutId = setTimeout(() => setIsBlocked(checkIsBlocked()), 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(secondTimeoutId);
    };
  }, [ref, ...deps]);

  return { isBlocked };
};
