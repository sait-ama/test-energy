import { ComponentProps } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getUserQueryKey } from '~entities/user/model/queries';
import { DetailedUserSchema } from '~shared/api/models/user';
import { useSession } from '~shared/lib/session/use-session';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const renderFriendStatus = ({
  friendMeta,
}: {
  friendMeta: DetailedUserSchema['friend_meta'];
}) => {
  if (!friendMeta?.status) return null;
  return friendMeta.status?.emoji?.image?.high ? (
    <img
      className="size-5 self-start"
      src={UrlFormatter.media(friendMeta?.status?.emoji?.image?.high)}
      alt="статус дружбы"
      style={{ width: 30, height: 30 }}
    />
  ) : (
    <>{friendMeta.status.emoji?.name || ''}</>
  );
};
export const UserStatusImage = ({
  friendMeta,
}: {
  friendMeta: DetailedUserSchema['friend_meta'];
}) => {
  return friendMeta?.status?.emoji?.image?.high ? (
    <img
      className="size-5 self-start"
      src={UrlFormatter.media(friendMeta?.status?.emoji?.image?.high)}
      alt="статус дружбы"
      style={{ width: 30, height: 30 }}
    />
  ) : null;
};

export const useFriendStatusWithRequest = ({
  userId,
}: { userId: NumberIsomorphicV2 } & ComponentProps<'div'>) => {
  const session = useSession((v) => v?.id);
  // @ts-ignore
  const { data: friend_meta, isPending } = useQuery({
    ...getUserQueryKey({ variables: { params: { userId } } }),
    select: (v) => v?.friend_meta,
    enabled: !!session,
  });
  const isNotValid = !session || !friend_meta?.status || isPending;
  return {
    isNotValid,
    isImage: !!friend_meta?.status?.emoji?.image?.high,
    render: () => (isNotValid ? null : renderFriendStatus({ friendMeta: friend_meta })),
  };
};
