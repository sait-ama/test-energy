import React, { useEffect } from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

interface CustomScrollAreaProps {
  orientation?: 'vertical' | 'horizontal';
  children:
    | React.ReactNode
    | ((state: { isDragging: boolean; shouldBlockInteractions: boolean }) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
  inertiaStrength?: number;
}

export const CustomScrollArea = ({
  orientation = 'vertical',
  children,
  className = '',
  style,
  inertiaStrength = 0.8,
}: CustomScrollAreaProps) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isInertiaActive, setIsInertiaActive] = React.useState(false);
  const [hasDragged, setHasDragged] = React.useState(false);
  const [hasScroll, setHasScroll] = React.useState({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });
  const startPos = React.useRef({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = React.useState(0);
  const animationFrame = React.useRef<number>(0);
  const lastMovePos = React.useRef(0);
  const lastMoveTime = React.useRef(0);
  const velocity = React.useRef(0);
  const isVertical = orientation === 'vertical';

  // todo pizdec, вынести в <WithObserver/> по пропсу
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScrollState = () => {
      if (!viewport) return;

      const newState = {
        left: viewport.scrollLeft > 0,
        right: viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth,
        top: viewport.scrollTop > 0,
        bottom: viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight,
      };

      setHasScroll(
        isVertical
          ? {
              left: false,
              right: false,
              top: newState.top,
              bottom: newState.bottom,
            }
          : {
              left: newState.left,
              right: newState.right,
              top: false,
              bottom: false,
            }
      );
    };

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(viewport);
    viewport.addEventListener('scroll', updateScrollState);

    return () => {
      observer.unobserve(viewport);
      viewport.removeEventListener('scroll', updateScrollState);
    };
  }, [isVertical]);

  const handleDragStart = (pos: { x: number; y: number }) => {
    setIsDragging(true);
    setHasDragged(false);
    startPos.current = pos;
    velocity.current = 0;

    if (viewportRef.current) {
      const scroll = isVertical ? viewportRef.current.scrollTop : viewportRef.current.scrollLeft;
      setScrollStart(scroll);
    }

    cancelAnimationFrame(animationFrame.current);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart({
      x: e.touches?.[0]?.clientX ?? 0,
      y: e.touches?.[0]?.clientY ?? 0,
    });
  };

  const handleMove = (currentPos: number) => {
    if (!isDragging || !viewportRef.current) return;

    const delta = currentPos - startPos.current[isVertical ? 'y' : 'x'];
    const deltaPosition = Math.abs(delta);

    if (deltaPosition > 5 && !hasDragged) {
      setHasDragged(true);
    }

    if (isVertical) {
      viewportRef.current.scrollTop = scrollStart - delta;
    } else {
      viewportRef.current.scrollLeft = scrollStart - delta;
    }

    const now = Date.now();
    const timeDiff = now - lastMoveTime.current;
    if (timeDiff > 0) {
      const posDiff = currentPos - lastMovePos.current;
      velocity.current = posDiff / timeDiff;
    }
    lastMovePos.current = currentPos;
    lastMoveTime.current = now;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(isVertical ? e.clientY : e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const pos = isVertical ? (e.touches?.[0]?.clientY ?? 0) : (e.touches?.[0]?.clientX ?? 0);
    handleMove(pos);
  };

  const applyInertia = () => {
    if (!viewportRef.current) return;

    const scrollProp = isVertical ? 'scrollTop' : 'scrollLeft';
    const maxScroll = isVertical
      ? viewportRef.current.scrollHeight - viewportRef.current.clientHeight
      : viewportRef.current.scrollWidth - viewportRef.current.clientWidth;

    let currentScroll = viewportRef.current[scrollProp];
    velocity.current *= inertiaStrength;

    currentScroll -= velocity.current * 16;

    if (currentScroll < 0 || currentScroll > maxScroll) {
      velocity.current = 0;
    }

    viewportRef.current[scrollProp] = currentScroll;

    if (Math.abs(velocity.current) > 0.01) {
      animationFrame.current = requestAnimationFrame(applyInertia);
    } else {
      setIsInertiaActive(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(velocity.current) > 0.1) {
      setIsInertiaActive(true);
      animationFrame.current = requestAnimationFrame(applyInertia);
    }
  };

  const shouldBlockInteractions = isDragging || isInertiaActive || hasDragged;

  return (
    <ScrollAreaPrimitive.Root
      className={cn(
        'relative overflow-hidden [--gradient-color:white/40] dark:[--gradient-color:black/40]',
        className
      )}
      style={style}
      type={isVertical ? 'scroll' : 'hover'}
    >
      {!isVertical && (
        <>
          <div
            className={cn(
              'from-background pointer-events-none absolute top-0 left-0 z-20 z-100 h-full w-7 bg-gradient-to-l to-[var(--gradient-color)] blur-md transition-opacity',
              !hasScroll.left && 'opacity-0'
            )}
          />
          <div
            className={cn(
              'from-background pointer-events-none absolute top-0 right-0 z-100 h-full w-10 bg-gradient-to-r to-[var(--gradient-color)] blur-md transition-opacity',
              !hasScroll.right && 'opacity-0'
            )}
          />
        </>
      )}

      {isVertical && (
        <>
          <div
            className={cn(
              'pointer-events-none absolute top-0 left-0 h-8 w-full to-transparent transition-opacity',
              !hasScroll.top && 'opacity-0'
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 h-8 w-full to-transparent transition-opacity',
              !hasScroll.bottom && 'opacity-0'
            )}
          />
        </>
      )}

      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          touchAction: 'none',
        }}
      >
        {typeof children === 'function'
          ? children({ isDragging, shouldBlockInteractions })
          : children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollAreaPrimitive.Scrollbar orientation={isVertical ? 'vertical' : 'horizontal'}>
        <ScrollAreaPrimitive.Thumb />
      </ScrollAreaPrimitive.Scrollbar>

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
};
