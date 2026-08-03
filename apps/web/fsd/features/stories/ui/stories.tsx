'use client';

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';
import { cn } from '@re/ui-kit/utils/cn';

import { useSwipeableTabs } from '~shared/hooks/use-swipeable-tabs';
import { TimerSubscriptionType, type TimerValue, useTimer } from '~shared/hooks/use-timer';

import { StoryProgress } from './story-progress';

const STORY_LENGTH = 5000; /* ms */ // poka hardcoded

interface StoriesItem {
  id: string;
}

interface StoriesContextInit {
  items: StoriesItem[];
  playOnInit?: boolean;
  defaultStory?: StoriesItem['id'];
}

type StoriesContextValue = {
  timer: TimerValue;
  items: StoriesItem[];
  currentStories: StoriesItem;
  setCurrentStories: Dispatch<SetStateAction<StoriesItem>>;
};

export const { Provider: StoriesProvider, useStore: useStoriesContext } = createContextSelector<
  StoriesContextValue,
  StoriesContextInit
>((init) => {
  const { items, playOnInit = false, defaultStory: defaultStoryId } = init;

  const [currentStories, setCurrentStories] = useState<StoriesItem | null>(() => {
    const defaultStory = defaultStoryId ? items.find((item) => item.id === defaultStoryId) : null;

    const initStory = defaultStory || items[0] || null;

    return initStory;
  });

  const timer = useTimer({
    from: 0,
    to: STORY_LENGTH,
    immediatelyStart: playOnInit,
    timeUnit: 'ms',
    refreshLimit: 0,
  });

  return {
    timer,
    items,
    currentStories,
    setCurrentStories,
  };
});

const resolveIndex = (index: number, length: number) => {
  if (index < 0) return length - 1;
  if (index >= length) return 0;

  return index;
};

export const useStoriesPlayback = () => {
  const { items, currentStories, setCurrentStories, timer } = useStoriesContext();

  const { hasNext, hasPrev } = useMemo(() => {
    const currentIndex = items.findIndex((v) => v.id === currentStories.id);

    const hasNext = currentIndex < items.length - 1;
    const hasPrev = currentIndex > 0;

    return { hasNext, hasPrev };
  }, [currentStories, items]);

  const next = useCallback(() => {
    if (!hasNext) return;

    // таймер на рафах...
    requestAnimationFrame(() => {
      setCurrentStories((prev) => {
        const currentIndex = items.findIndex((v) => v.id === prev.id);

        if (currentIndex === items.length - 1) return prev;

        return items[resolveIndex(currentIndex + 1, items.length)]!;
      });
    });

    timer.restart();
  }, [items, hasNext]);

  const prev = useCallback(() => {
    if (!hasPrev) return;

    requestAnimationFrame(() => {
      setCurrentStories((prev) => {
        const currentIndex = items.findIndex((v) => v.id === prev.id);

        if (currentIndex === 0) return prev;

        return items[resolveIndex(currentIndex - 1, items.length)]!;
      });
    });

    timer.restart();
  }, [items, hasPrev]);

  const pause = () => timer.pause();
  const resume = () => timer.start();

  const isPlaying = timer.isTicking;

  return { next, prev, hasNext, hasPrev, isPlaying, pause, resume, storyId: currentStories?.id };
};

interface StoriesRootProps extends StoriesContextInit {
  children: ReactNode;
  className?: string;
}
interface StoriesRootInternalProps {
  children: ReactNode;
  className?: string;
}
const StoriesRootInternal = (props: StoriesRootInternalProps) => {
  const { children, className } = props;

  const { timer, items, currentStories } = useStoriesContext();
  const { next, prev, pause, resume } = useStoriesPlayback();
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subKey = timer.subscribe(TimerSubscriptionType.STOP, () => {
      next();
    });

    return () => {
      timer.unsubscribe(TimerSubscriptionType.STOP, subKey);
    };
  }, [next]);

  useEffect(() => {
    const element = itemRef?.current;
    if (!element) return;

    let isHolding = false;

    const handlePointerDown = () => {
      isHolding = true;
      pause();
    };

    const handlePointerUp = () => {
      if (!isHolding) return;
      isHolding = false;
      resume();
    };

    element.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const { ref: swipeRef, ...restHandlers } = useSwipeableTabs({
    variants: items.map((item) => item.id),
    value: currentStories.id,
    onChange: ({ action }) => (action === 'next' ? next() : prev()),
  });

  swipeRef(itemRef.current);

  return (
    <div className={cn('flex flex-col', className)}>
      <StoriesBar />
      <div className="relative flex size-full flex-[1] flex-col" ref={itemRef} {...restHandlers}>
        {children}
      </div>
    </div>
  );
};

export const StoriesRoot = (props: StoriesRootProps) => {
  const { children, items, className, playOnInit, defaultStory } = props;

  const StoriesContextInit = {
    items,
    playOnInit,
    defaultStory,
  };

  return (
    <StoriesProvider value={StoriesContextInit}>
      <StoriesRootInternal className={className}>{children}</StoriesRootInternal>
    </StoriesProvider>
  );
};

export const StoriesBar = () => {
  const { items, currentStories, timer } = useStoriesContext();

  const currentItemIndex = items.findIndex((item) => item.id === currentStories.id);

  const getProgress = (index: number) => {
    if (index > currentItemIndex) return 0;
    if (index < currentItemIndex) return 1;

    const progress = timer.time / STORY_LENGTH;

    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    return progress;
  };

  return (
    <div className="gap-xxs relative flex">
      {items.map((item, index) => (
        <StoryProgress key={item.id} progress={getProgress(index)} className="h-xxs w-full" />
      ))}
    </div>
  );
};

export interface StoriesOverlayProps {
  children?: ReactNode;
}

export const StoriesOverlay = (props: StoriesOverlayProps) => {
  const { children } = props;

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div onPointerDownCapture={prevent} onPointerUpCapture={prevent}>
      {children}
    </div>
  );
};

export interface StoriesBackdropProps {
  children?: ReactNode;
  className?: string;
}

export const StoriesBackdrop = (props: StoriesBackdropProps) => {
  const { children, className } = props;

  return <div className={cn('absolute top-0 left-0 h-full w-full', className)}>{children}</div>;
};

export interface StoriesItemProps {
  children?: ReactNode;
}

export const StoriesItem = (props: StoriesItemProps) => {
  const { children } = props;

  return children;
};

export interface StoriesItemBackdropProps {
  children?: ReactNode;
}

export const StoriesItemBackdrop = (props: StoriesItemBackdropProps) => {
  const { children } = props;

  return children;
};

export interface StoriesOverlayItemProps {
  children?: ReactNode;
}

export const StoriesOverlayItem = (props: StoriesOverlayItemProps) => {
  const { children } = props;

  return children;
};

interface StoriesItemContentProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export const StoriesItemContent = (props: StoriesItemContentProps) => {
  const { children, id, className } = props;
  const { currentStories } = useStoriesContext();
  const show = currentStories?.id === id;

  return show ? (
    <div className={cn('relative flex h-full w-full flex-[1]', className)}>{children}</div>
  ) : null;
};
