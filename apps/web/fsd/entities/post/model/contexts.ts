'use client';
import { createZustandContext } from '@re/core/utils/create-zustand-context';

import { createForumTagsStore, ForumTagsStore } from './store';

const {
  Provider: ForumTagsProvider,
  useStore: useForumTags,
  useStoreApi: useForumTagsStoreApi,
} = createZustandContext<ForumTagsStore>(createForumTagsStore, 'ForumTags');

export { ForumTagsProvider, useForumTags, useForumTagsStoreApi };
