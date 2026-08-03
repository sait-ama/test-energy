import { useCallback } from 'react';

import type { UseMapActions } from '~shared/hooks/use-map';
import { useMap } from '~shared/hooks/use-map';

interface UseMapOfSetsActions<K, V, U extends Set<V> | undefined = Set<V> | undefined>
  extends UseMapActions<K, U> {
  addToSet: (key: K, value: V) => void;
  removeFromSet: (key: K, value: V) => void;
}

export type UseMapOfSetsReturn<K, V, U extends Set<V> | undefined = Set<V> | undefined> = [
  Omit<Map<K, U>, 'set' | 'clear' | 'delete'>,
  UseMapOfSetsActions<K, V, U>,
];

export function useMapOfSets<K, V>(initialState = new Map()): UseMapOfSetsReturn<K, V> {
  const [map, mapActions] = useMap<K, Set<V> | undefined>(initialState);

  const setActions = {
    addToSet: useCallback(
      (key: K, value: V): void => {
        const set = map.has(key) ? new Set<V>(map.get(key)) : new Set<V>();
        set.add(value);
        mapActions.set(key, set);
      },
      [mapActions]
    ),

    removeFromSet: useCallback(
      (key: K, value: V): void => {
        if (!map.has(key)) return;

        const set = new Set<V>(map.get(key));
        set.delete(value);

        mapActions.set(key, set);
      },
      [mapActions]
    ),
  };

  return [map, { ...mapActions, ...setActions }];
}
