import { useCallback, useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';

export enum TimerSubscriptionType {
  STOP = 'stop',
}
type TimerSubscriptions = Record<string, () => void>;
interface Cache {
  config: {
    from: number;
    to: number;
    refreshLimit: number;
    timeUnit: 'ms' | 's';
    onStop?: () => void;
  };
  isRemoved: boolean;
  timerState: 'idle' | 'ticking';
  memoizedTimePassed: number;
  subscriptions: {
    [TimerSubscriptionType.STOP]: TimerSubscriptions;
  };
}

interface Options {
  from: number; // ms or s
  to: number; // ms or s
  refreshLimit?: number; // always ms
  timeUnit?: 'ms' | 's'; // affects 'from', 'to' options and returned 'time'
  immediatelyStart?: boolean; // start ticking after first useTimer call
  onStop?: () => void; // called after timer has stopped on its own (when time is out) or 'stop' call
}

export interface TimerValue {
  time: number;
  isTicking: boolean;
  subscribe: (type: TimerSubscriptionType, callback: () => void) => string;
  unsubscribe: (type: TimerSubscriptionType, key: string) => void;
  start: () => void;
  restart: () => void;
  reset: () => void;
  pause: () => void;
  stop: () => void;
}

// todo: rewrite lapshu
// stopwatch/countdown etc, supports ascending and descending ticking
export function useTimer(options: Options) {
  // memoized between renders values
  const cacheRef = useRef<Cache>({
    config: {
      timeUnit: options.timeUnit ?? 's',
      from: options.timeUnit === 'ms' ? options.from : options.from * 1000,
      to: options.timeUnit === 'ms' ? options.to : options.to * 1000,
      refreshLimit: options.refreshLimit ?? (options.timeUnit === 'ms' ? 16 : 1000),
    },
    subscriptions: {
      stop: {},
    },
    isRemoved: false,
    timerState: 'idle',
    memoizedTimePassed: 0,
  });

  // safe to use
  const cache = cacheRef.current;

  function getNormalizedTime(time: number) {
    return Math.round(cache.config.timeUnit === 'ms' ? time : time / 1000);
  }

  function startLoop() {
    switch (cache.timerState) {
      case 'idle':
        break;
      case 'ticking':
      default:
        return;
    }

    if (cache.isRemoved) return;

    cache.timerState = 'ticking';

    const isAscending = cache.config.from <= cache.config.to;
    let previousTimestamp: number | null = null;
    let lastUpdateTimestamp: number | null = null;

    function tick() {
      requestAnimationFrame((currentTimestamp: number) => {
        // on unmount
        if (cache.isRemoved) return;

        if (cache.timerState === 'idle') {
          setIsTicking(false);
          return;
        }

        if (previousTimestamp == null) {
          previousTimestamp = currentTimestamp;
          setIsTicking(true);
        }

        cache.memoizedTimePassed += currentTimestamp - previousTimestamp;

        const timeToPass = isAscending
          ? cache.config.to - cache.config.from
          : cache.config.from - cache.config.to;

        // exit recursion if time is out
        if (cache.memoizedTimePassed >= timeToPass) {
          cache.timerState = 'idle';
          setTime(getNormalizedTime(cache.config.to));
          setIsTicking(false);
          cache.config.onStop?.();
          cache.memoizedTimePassed = 0;

          Object.values(cache.subscriptions.stop).forEach((callback) => callback());
          return;
        }

        if (
          !lastUpdateTimestamp ||
          currentTimestamp - lastUpdateTimestamp >= cache.config.refreshLimit
        ) {
          const timeMs = isAscending
            ? cache.config.from + cache.memoizedTimePassed
            : cache.config.from - cache.memoizedTimePassed;
          setTime(getNormalizedTime(timeMs));

          lastUpdateTimestamp = currentTimestamp;
        }

        previousTimestamp = currentTimestamp;
        tick();
      });
    }

    tick();
  }

  const [isTicking, setIsTicking] = useState(false);
  const [time, setTime] = useState(options.from);

  // start ticking preserving time (e.g. after pause call)
  const start = useCallback(() => {
    if (cache.timerState === 'idle') startLoop();
  }, []);

  // start ticking resetting time to 'from' value
  const restart = useCallback(() => {
    startLoop();

    cache.memoizedTimePassed = 0;
  }, []);

  // stop ticking and reset time to 'from' value
  const reset = useCallback(() => {
    cache.timerState = 'idle';
    cache.memoizedTimePassed = 0;
    setTime(getNormalizedTime(cache.config.from));
  }, []);

  // stop ticking and preserve time
  const pause = useCallback(() => {
    cache.timerState = 'idle';
  }, []);

  // stop ticking, reset time and call 'onStop' callback
  const stop = useCallback(() => {
    if (cache.timerState === 'ticking') {
      cache.timerState = 'idle';
      cache.config.onStop?.();
    }
  }, []);

  const subscribe = (type: TimerSubscriptionType, callback: () => void) => {
    const key = nanoid(5);
    cache.subscriptions[type][key] = callback;

    return key;
  };

  const unsubscribe = (type: TimerSubscriptionType, key: string) => {
    delete cache.subscriptions[type][key];
  };

  useEffect(() => {
    if (options.immediatelyStart) {
      start();
    }
    cache.isRemoved = false;

    return () => {
      cache.isRemoved = true;
    };
  }, []);

  const timer: TimerValue = {
    subscribe,
    unsubscribe,
    time,
    isTicking,
    start,
    restart,
    reset,
    pause,
    stop,
  };

  return timer;
}
