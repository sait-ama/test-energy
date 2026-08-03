import { useCallback, useEffect, useState } from 'react';

// vendor-prefixed: так нада
declare global {
  interface Document {
    webkitHidden?: boolean;
    webkitVisibilityState?: string;
    mozHidden?: boolean;
    mozVisibilityState?: string;
    msHidden?: boolean;
    msVisibilityState?: string;
    oHidden?: boolean;
    oVisibilityState?: string;
  }
}

type VisibilityEvent = {
  hidden: string;
  event: string;
  state: string;
};

const hasDocument = typeof document !== 'undefined';

const vendorEvents: VisibilityEvent[] = [
  {
    hidden: 'hidden',
    event: 'visibilitychange',
    state: 'visibilityState',
  },
  {
    hidden: 'webkitHidden',
    event: 'webkitvisibilitychange',
    state: 'webkitVisibilityState',
  },
  {
    hidden: 'mozHidden',
    event: 'mozvisibilitychange',
    state: 'mozVisibilityState',
  },
  {
    hidden: 'msHidden',
    event: 'msvisibilitychange',
    state: 'msVisibilityState',
  },
  {
    hidden: 'oHidden',
    event: 'ovisibilitychange',
    state: 'oVisibilityState',
  },
];

const isSupported = hasDocument && Boolean(document.addEventListener);

const getVisibilityConfig = (): VisibilityEvent | null => {
  if (!isSupported) return null;

  for (const event of vendorEvents) {
    if (event.hidden in document) {
      return event;
    }
  }
  return null;
};

const visibilityConfig = getVisibilityConfig();

const getVisibilityState = (): [boolean, string] => {
  if (!visibilityConfig) {
    return [true, 'visible'];
  }

  const { hidden, state } = visibilityConfig;

  const isHidden =
    document[hidden as keyof Document] !== undefined
      ? !(document[hidden as keyof Document] as boolean)
      : true;

  const visibilityState =
    document[state as keyof Document] !== undefined
      ? String(document[state as keyof Document])
      : 'visible';

  return [isHidden, visibilityState];
};

export const usePageVisibility = (): boolean => {
  const [initiallyVisible] = getVisibilityState();
  const [isVisible, setIsVisible] = useState(initiallyVisible);

  const handleVisibilityChange = useCallback(() => {
    const [currentlyVisible] = getVisibilityState();
    setIsVisible(currentlyVisible);
  }, []);

  useEffect(() => {
    if (!visibilityConfig) return;

    document.addEventListener(visibilityConfig.event, handleVisibilityChange);
    return () => {
      document.removeEventListener(visibilityConfig.event, handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return isVisible;
};
