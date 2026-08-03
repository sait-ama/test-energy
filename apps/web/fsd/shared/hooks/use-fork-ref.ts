import * as React from 'react';

import { type CallbackRef, setRef } from '@re/core/utils/setRef';

export function useForkRef<T>(
  refA: React.Ref<T> | CallbackRef<T> | null | undefined,
  refB: React.Ref<T> | CallbackRef<T> | null | undefined
): CallbackRef<T> | null {
  return React.useMemo(
    () =>
      refA == null && refB == null
        ? null
        : (refValue: T | null) => {
            setRef(refA as any, refValue);
            setRef(refB as any, refValue);
          },
    [refA, refB]
  );
}
