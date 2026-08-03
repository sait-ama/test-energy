import { ChannelMemberSchema } from 'module/chat/model/types';

import { useSession } from '~shared/lib/session/use-session';

import { useChannelStateContext } from '../../../../context';

export const useUserRole = (user?: ChannelMemberSchema, onlySenderCanEdit?: boolean) => {
  const { channel, channelCapabilities = {} } = useChannelStateContext('useUserRole');
  const session = useSession();

  // TODO
  const isAdmin = false;
  const isOwner = false;
  const isModerator = false;

  const isMyMessage = !!user && session!.id === user.id;

  const canEdit =
    (!onlySenderCanEdit && channelCapabilities['update-any-message']) ||
    (isMyMessage && channelCapabilities['update-own-message']);

  const canDelete =
    channelCapabilities['delete-any-message'] ||
    (isMyMessage && channelCapabilities['delete-own-message']);

  const canReply = channelCapabilities['send-reply'];
  const canForward = channelCapabilities['send-forward'];

  return {
    canDelete,
    canEdit,
    canForward,
    canReply,
    isAdmin,
    isModerator,
    isMyMessage,
    isOwner,
  };
};
