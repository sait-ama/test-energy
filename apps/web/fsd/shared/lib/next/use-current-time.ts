import { useLayoutEffect, useState } from 'react';

export const useCurrentTime = (deps?: (string | boolean | number)[]) => {
  const [time, setTime] = useState<string | null>(null);

  useLayoutEffect(() => {
    setTime(new Date().toString());
  }, [deps]);

  return time;
};
