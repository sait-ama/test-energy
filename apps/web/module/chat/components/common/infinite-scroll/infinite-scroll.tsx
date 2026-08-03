import React, { PropsWithChildren, useEffect, useRef } from 'react';

import { DEFAULT_LOAD_PAGE_SCROLL_THRESHOLD } from '../../../constants/limits';
import type { PaginatorProps } from '../../../types/types';

/**
 * Prevents Chrome hangups
 * See: https://stackoverflow.com/questions/47524205/random-high-content-download-time-in-chrome/47684257#47684257
 */
const mousewheelListener = (event: Event) => {
  if (event instanceof WheelEvent && event.deltaY === 1) {
    event.preventDefault();
  }
};

export type InfiniteScrollProps = PaginatorProps & {
  className?: string;
  element?: React.ElementType;
  /** Element to be rendered at the top of the thread message list. By default, Message and ThreadStart components */
  head?: React.ReactNode;
  initialLoad?: boolean;
  isLoading?: boolean;
  listenToScroll?: (offset: number, reverseOffset: number, threshold: number) => void;
  loader?: React.ReactNode;
  useCapture?: boolean;
};

/**
 * This component serves a single purpose - load more items on scroll inside the MessageList component
 * It is not a general purpose infinite scroll controller, because:
 * 1. It is re-rendered whenever queryInProgress, hasNext, hasPrev changes. This can lead to scrollListener to have stale data.
 * 2. It pretends to invoke scrollListener on resize event even though this event is emitted only on window resize. It should
 * rather use ResizeObserver. But then again, it ResizeObserver would invoke a stale version of scrollListener.
 *
 * In general, the infinite scroll controller should not aim for checking the loading state and whether there is more data to load.
 * That should be controlled by the loading function.
 */
export const InfiniteScroll = (props: PropsWithChildren<InfiniteScrollProps>) => {
  const {
    children,
    element = 'div',
    hasNextPage,
    hasPreviousPage,
    head,
    initialLoad = true,
    isLoading,
    listenToScroll,
    loader,
    loadNextPage,
    loadPreviousPage,
    threshold = DEFAULT_LOAD_PAGE_SCROLL_THRESHOLD,
    useCapture = false,
    ...elementProps
  } = props;

  const scrollComponent = useRef<HTMLElement>(undefined);
  const previousOffset = useRef<number | undefined>(undefined);
  const previousReverseOffset = useRef<number | undefined>(undefined);

  const scrollListenerRef = useRef<() => void>(undefined);
  scrollListenerRef.current = () => {
    const element = scrollComponent.current;

    if (!element || element.offsetParent === null) {
      return;
    }

    const parentElement = element.parentElement!;

    const offset = element.scrollHeight - parentElement.scrollTop - parentElement.clientHeight;
    const reverseOffset = parentElement.scrollTop;

    if (listenToScroll) {
      listenToScroll(offset, reverseOffset, threshold);
    }

    if (isLoading) return;
    if (previousOffset.current === offset && previousReverseOffset.current === reverseOffset)
      return;
    previousOffset.current = offset;
    previousReverseOffset.current = reverseOffset;

    // FIXME: this triggers loadMore call when a user types messages in thread and the scroll container expands
    if (
      reverseOffset < Number(threshold) &&
      typeof loadPreviousPage === 'function' &&
      hasPreviousPage
    ) {
      loadPreviousPage();
    }

    if (offset < Number(threshold) && typeof loadNextPage === 'function' && hasNextPage) {
      loadNextPage();
    }
  };

  useEffect(() => {
    const scrollElement = scrollComponent.current?.parentNode;
    if (!scrollElement) return;

    const scrollListener = () => scrollListenerRef.current?.();

    scrollElement.addEventListener('scroll', scrollListener, useCapture);
    scrollElement.addEventListener('resize', scrollListener, useCapture);
    scrollListener();

    return () => {
      scrollElement.removeEventListener('scroll', scrollListener, useCapture);
      scrollElement.removeEventListener('resize', scrollListener, useCapture);
    };
  }, [initialLoad, useCapture]);

  useEffect(() => {
    const scrollElement = scrollComponent.current?.parentNode;
    if (scrollElement) {
      scrollElement.addEventListener('wheel', mousewheelListener, { passive: false });
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('wheel', mousewheelListener, useCapture);
      }
    };
  }, [useCapture]);

  const attributes = {
    ...elementProps,
    ref: (element: HTMLElement) => {
      scrollComponent.current = element;
    },
  };

  const childrenArray = [loader, children];

  if (head) {
    childrenArray.unshift(head);
  }

  return React.createElement(element, attributes, childrenArray);
};
