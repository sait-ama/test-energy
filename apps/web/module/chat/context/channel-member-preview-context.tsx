import { createZustandContext } from '@re/core/utils/create-zustand-context';

import { UserPreviewStore, useUserPreviewStore } from '../store/user-preview-store';

export const { Provider: ChannelMemberPreviewProvider, useStore: useChannelMemberPreviewContext } =
  createZustandContext<UserPreviewStore>(() => useUserPreviewStore, 'ChannelMemberList');
