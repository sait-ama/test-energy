'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

type ShadowScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root>;

const ShadowScrollArea: React.FC<ShadowScrollAreaProps> = function ShadowScrollArea({
  className,
  children,
  ...props
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLeftShadowVisible, setIsLeftShadowVisible] = useState(false);
  const [isRightShadowVisible, setIsRightShadowVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

      setIsLeftShadowVisible(scrollLeft > 0);
      setIsRightShadowVisible(scrollLeft + clientWidth < scrollWidth);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Левая тень */}
      {isLeftShadowVisible && (
        <div className="from-background/60 pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r to-transparent transition-opacity duration-300" />
      )}

      <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)} {...props}>
        <ScrollAreaPrimitive.Viewport
          ref={scrollRef}
          className="h-full w-full overflow-x-auto rounded-[inherit]"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>

      {/* Правая тень */}
      {isRightShadowVisible && (
        <div className="from-background/60 pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l to-transparent transition-opacity duration-300" />
      )}
    </div>
  );
};

ShadowScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

type ScrollBarProps = React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>;

const ScrollBar: React.FC<ScrollBarProps> = function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        'flex touch-none transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' && 'h-2 flex-col border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
};

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollBar, ShadowScrollArea };
