'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { StoreApi } from 'zustand/vanilla';

import type { FiltersStore } from './store';
import type { FiltersProps, FiltersSchema, FilterTypeConstraint } from './types';
import { serializeFiltersToQueryString } from './utils';

export interface FiltersContextHookOptions<TFilterTypes extends FilterTypeConstraint>
  extends FiltersProps<TFilterTypes> {
  storeApi: StoreApi<FiltersStore<TFilterTypes>>;
}

/**
 * Типы для опций контекста с поддержкой хуков
 */
export interface FiltersContextHook<TFilterTypes extends FilterTypeConstraint> {
  (params: FiltersContextHookOptions<TFilterTypes>): void;
}

/**
 * Хук для синхронизации фильтров с URL параметрами (Next.js App Router)
 * Только передает изменения фильтров в URL (state -> URL)
 * Для инициализации используйте parseUrlToInitialState из utils
 */
export function useUrlSync<TFilterTypes extends FilterTypeConstraint>({
  storeApi,
  onChange,
}: FiltersContextHookOptions<TFilterTypes>) {
  const router = useRouter();

  useEffect(() => {
    // Проверяем что мы в браузере (не SSR)
    if (typeof window === 'undefined') return;

    const state = storeApi.getState();
    const { schema } = state;

    // Подписка на изменения фильтров для обновления URL
    const unsubscribe = storeApi.subscribe(
      (state: FiltersStore<TFilterTypes>, prevState: FiltersStore<TFilterTypes>) => {
        const currentActiveFilters = state.activeFilters;
        const previousActiveFilters = prevState.activeFilters;

        // Проверяем изменились ли активные фильтры
        const filtersChanged =
          JSON.stringify(currentActiveFilters) !== JSON.stringify(previousActiveFilters);

        if (filtersChanged) {
          if (onChange) {
            onChange(currentActiveFilters);
          } else {
            // Используем утилиту для преобразования фильтров в query string
            const queryString = serializeFiltersToQueryString(currentActiveFilters, schema);
            const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

            // Используем Next.js router для обновления URL
            router.replace(newUrl, { scroll: false });
          }
        }
      }
    );

    return unsubscribe;
  }, [storeApi, router, onChange]);
}

/**
 * Хук для обновления схемы фильтров
 * Используется если схема фильтров динамическая
 */
export function useUpdateFilterSchema<TFilterTypes extends FilterTypeConstraint>({
  storeApi,
  schema,
}: FiltersContextHookOptions<TFilterTypes>) {
  const schemaRef = useRef<FiltersSchema<TFilterTypes>>(schema);
  useEffect(() => {
    if (schemaRef.current !== schema) {
      schemaRef.current = schema;
      storeApi.getState().updateSchema(schema);
    }
  }, [schema]);
}
