import type { MutableRefObject } from 'react';
import { useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';

import { SectionVisibilityContext } from '~features/page-section-visibility/model/context';
import { useScrollBottomTrigger } from '~shared/hooks/use-scroll-bottom-trigger';

interface SubscriberType {
  key: string;
  callback: () => void;
}

export const useShownControl = (containerRef: MutableRefObject<HTMLElement | null>) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberType[]>([]);

  const subscribe = useCallback((key: string, callback: () => void) => {
    setSubscribers((subscribers) => {
      const index = subscribers.findIndex((subscriber) => subscriber.key === key);

      if (index !== -1) {
        const newSubscribers = [...subscribers];
        newSubscribers[index] = { key, callback };
        return newSubscribers;
      }
      return [...subscribers, { key, callback }];
    });

    return () => {
      setSubscribers((subscribers) => {
        const index = subscribers.findIndex((subscriber) => subscriber.key === key);

        if (index !== -1) {
          const newSubscribers = [...subscribers];
          newSubscribers.splice(index, 1);
          return newSubscribers;
        }
        return subscribers;
      });
    };
  }, []);

  const onSubscriberLoaded = (subscriberId: string) => {
    setLoading((id) => (id === subscriberId ? null : id));
  };

  const onSubscriberError = (subscriberId: string) => {
    setLoading((id) => (id === subscriberId ? null : id));
  };

  const onLoadNextBlock = async () => {
    if (subscribers.length > 0) {
      const subscriber = subscribers.shift();

      if (subscriber) {
        setLoading(subscriber.key);
        subscriber.callback();
      }
    }
  };

  const canLoadNextBlock = !loading && subscribers.length > 0;

  const { detectScrollAtBottom } = useScrollBottomTrigger({
    fn: onLoadNextBlock,
    containerRef,
    canTrigger: canLoadNextBlock,
  });

  const store = useMemo(
    () => ({
      countSubscribers: subscribers.length,
      subscribe,
      onSubscriberError,
      onSubscriberLoaded,
      detectScrollAtBottom,
    }),
    []
  );

  return { store, loading };
};

export const useLayoutGroupShowControl = (defaultShown: boolean) => {
  const reactId = useId();
  const id = reactId.slice(1, -1);
  const { subscribe, onSubscriberLoaded, onSubscriberError } = useContext(SectionVisibilityContext);

  const [shown, setShown] = useState(defaultShown);

  useEffect(() => {
    if (!shown) {
      const unsubscribe = subscribe(id, () => {
        setShown(true);
      });

      return unsubscribe;
    }
  }, [id]);

  return {
    shown,
    setShown,
    onSuccess: () => onSubscriberLoaded(id),
    onError: () => onSubscriberError(id),
  };
};
