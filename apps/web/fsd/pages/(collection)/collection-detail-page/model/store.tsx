'use client';

import { useMemo, useState } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { NArray } from '~shared/utils/NArray';

export const { Provider: CollectionProvider, useStore: useCollectionStore } = createContextSelector(
  () => {
    const [genres, setGenres] = useState<number[]>([]);

    const handleChange = (id: number) => {
      setGenres((prev) => {
        if (prev.includes(id)) return prev.filter((item) => item !== id);
        return [...prev, id];
      });
    };

    const valueMap = useMemo(
      () =>
        NArray.newBy(genres).recordBy(
          (it) => it,
          () => true
        ),
      [genres]
    );

    const handleReset = () => {
      setGenres([]);
    };

    return {
      valueMap,
      value: genres,
      setValue: handleChange,
      reset: handleReset,
    } as const;
  },
  'CollectionStore'
);
