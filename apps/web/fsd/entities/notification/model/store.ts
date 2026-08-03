'use client';

import { useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';

export const { useStore: useNotificationStore, Provider: NotificationStoreProvider } =
  createContext(() => {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelect = (id: number) => {
      if (selectedIds.includes(id)) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    };

    const handleGroupCheck = (ids: number[] | undefined) => {
      setSelectedIds((prev) => {
        if (!ids) return prev;

        const allSelected = ids?.every((id) => prev.includes(id)) ?? false;

        if (allSelected) {
          return prev.filter((id) => !ids?.includes(id));
        }

        return Array.from(new Set([...prev, ...ids]));
      });
    };

    return { selectedIds, setSelectedIds, handleSelect, handleGroupCheck };
  }, 'NotificationStore');

export const useNotificationsStatus = () => {
  return useQueryPrimitiveParams({
    fieldName: 'status',
    defaultValue: '0',
  });
};
