'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import { createContextSelector } from '@re/core/utils/create-context-selector';

import { useBookmarkOrderingQueryState } from '~entities/bookmarks/model/hooks';
import { useQueryState } from '~shared/hooks/use-query-state-v2';

interface UseBookmarksContext {
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

interface BookmarksProviderOptions {
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

export const { Provider: BookmarksProvider, useStore: useBookmarksContext } = createContextSelector<
  UseBookmarksContext,
  BookmarksProviderOptions
>(({ isEdit, setIsEdit }) => ({
  isEdit,
  setIsEdit,
}));

export const useBookmarkId = () =>
  useQueryState<string, NumberIsomorphic>({ key: 'type', defaultValue: '1' });

export const useBookmarkOrdering = () => useBookmarkOrderingQueryState('bookmark-ordering');

export const { useStore: useBookmarkActionTab, Provider: BookmarkActionTabProvider } =
  createContextSelector(() => {
    const [actionTab, setActionTab] = useState<
      'bookmarks' | 'paid-notifications' | 'push-notifications'
    >('bookmarks');

    return {
      actionTab,
      setActionTab,
    };
  }, 'BookmarkActionStore');
