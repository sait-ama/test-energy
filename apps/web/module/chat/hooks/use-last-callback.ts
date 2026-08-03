import { useCallback } from 'react';

import { useStateRef } from './use-state-ref';

export function useLastCallback<T extends AnyFunction>(callback?: T) {
  const ref = useStateRef(callback);

  return useCallback((...args: Parameters<T>) => ref.current?.(...args), []) as T;
}

export default useLastCallback;
