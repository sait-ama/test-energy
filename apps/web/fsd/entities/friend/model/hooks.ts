'use client';
import { useParams } from 'next/navigation';

import { useFriendsPaginatedListQuery } from '~entities/friend/model/queries';

export const useCurrentUserFriendsPaginatedListQuery = () => {
  const { id: userId } = useParams<{ id: string }>();

  return useFriendsPaginatedListQuery({
    variables: {
      params: { userId },
      query: { count: 20, page: 1 },
    },
  });
};
