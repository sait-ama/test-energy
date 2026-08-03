import { useCallback, useEffect, useRef, useState } from 'react';

import { animate, PanInfo, useMotionValue } from 'motion/react';

import { MomentSchema } from '~shared/api/models/inventory';

//todo
interface ScrollStoreParams {
  data: MomentSchema[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

interface ScrollStoreReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  index: number;
  containerProps: {
    style: { y: any };
    onPanStart: () => void;
    onPan: (_event: any, info: PanInfo) => void;
    onPanEnd: (_event: any, info: PanInfo) => void;
  };
  itemProps: (index: number) => {
    key: string;
    style: { height: string };
  };
}

export const useScrollStore = ({
  data,
  activeIndex,
  setActiveIndex,
}: ScrollStoreParams): ScrollStoreReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const wheelCooldownRef = useRef(false);
  const keyboardCooldownRef = useRef(false);

  // Motion values for smooth animations
  const y = useMotionValue(0);

  // Calculate container height based on viewport
  const itemHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;

  // Update position when activeIndex changes
  useEffect(() => {
    if (!isDragging) {
      const targetY = -activeIndex * itemHeight;
      animate(y, targetY, {
        type: 'tween',
        duration: 0.4,
        ease: 'easeOut',
      });
    }
  }, [activeIndex, itemHeight, isDragging, y]);

  // Handle wheel events for desktop
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isDragging || wheelCooldownRef.current) return;

      // Only handle wheel events within our container
      const container = containerRef.current;
      if (!container || !container.contains(e.target as Node)) return;

      e.preventDefault();

      const threshold = 50;
      const deltaY = e.deltaY;

      if (Math.abs(deltaY) < threshold) return;

      // Set cooldown to prevent rapid scrolling
      wheelCooldownRef.current = true;
      setTimeout(() => {
        wheelCooldownRef.current = false;
      }, 300); // 300ms cooldown

      if (deltaY > 0 && activeIndex < data.length - 1) {
        setActiveIndex((prev) => prev + 1);
      } else if (deltaY < 0 && activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }

    return undefined;
  }, [activeIndex, data.length, isDragging]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDragging || keyboardCooldownRef.current || e.target !== document.body) return;

      let shouldPrevent = false;

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          if (activeIndex < data.length - 1) {
            shouldPrevent = true;
            keyboardCooldownRef.current = true;
            setTimeout(() => {
              keyboardCooldownRef.current = false;
            }, 200); // 200ms cooldown for keyboard
            setActiveIndex((prev) => prev + 1);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          if (activeIndex > 0) {
            shouldPrevent = true;
            keyboardCooldownRef.current = true;
            setTimeout(() => {
              keyboardCooldownRef.current = false;
            }, 200); // 200ms cooldown for keyboard
            setActiveIndex((prev) => prev - 1);
          }
          break;
      }

      if (shouldPrevent) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, data.length, isDragging]);

  // Pan gesture handlers
  const handlePanStart = () => {
    setIsDragging(true);
  };

  const handlePan = (_event: any, info: PanInfo) => {
    if (!containerRef.current) return;

    // Calculate new position based on drag
    const currentY = -activeIndex * itemHeight;
    const newY = currentY + info.offset.y;

    // Add resistance at boundaries
    const maxY = 0;
    const minY = -(data.length - 1) * itemHeight;

    let constrainedY = newY;
    if (newY > maxY) {
      constrainedY = maxY + (newY - maxY) * 0.3;
    } else if (newY < minY) {
      constrainedY = minY + (newY - minY) * 0.3;
    }

    y.set(constrainedY);
  };

  const handlePanEnd = (_event: any, info: PanInfo) => {
    setIsDragging(false);

    const threshold = itemHeight * 0.25; // 25% of item height
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    let newIndex = activeIndex;

    // Determine direction based on velocity and offset
    if (Math.abs(velocity) > 500) {
      // Fast swipe - use velocity
      if (velocity < 0 && activeIndex < data.length - 1) {
        newIndex = activeIndex + 1;
      } else if (velocity > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      }
    } else if (Math.abs(offset) > threshold) {
      // Slow drag - use offset
      if (offset < 0 && activeIndex < data.length - 1) {
        newIndex = activeIndex + 1;
      } else if (offset > 0 && activeIndex > 0) {
        newIndex = activeIndex - 1;
      }
    }

    setActiveIndex(newIndex);
  };

  const itemProps = useCallback(
    (index: number) => ({
      key: data[index]?.id?.toString() || index.toString(),
      style: { height: `${itemHeight}px` },
    }),
    [itemHeight, data]
  );

  return {
    ref: containerRef,
    index: activeIndex,
    containerProps: {
      style: { y },
      onPanStart: handlePanStart,
      onPan: handlePan,
      onPanEnd: handlePanEnd,
    },
    itemProps: itemProps,
  };
};
