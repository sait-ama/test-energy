import { useParams } from 'next/navigation';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherRepository } from '~entities/publisher/model/repository';
import type { PublisherMembersListResponseSchema } from '~shared/api/models/publisher';
import { customSkipToken, getQueryClient, useOptimisticMutation } from '~shared/api/react-query';

export const useRemoveMemberMutation = ({ userId }: { userId: number }) => {
  const { dir } = useParams();
  const { data: { content } = {} } = usePublisherQuery({ variables: { params: { dir } } });
  return useOptimisticMutation({
    onSuccess: () => {
      getQueryClient().setQueryData<PublisherMembersListResponseSchema>(
        PublisherQueryKey.membersByPublisherId({ params: { publisherId: content!.id } }),
        (data) => {
          if (!data) return data;
          return { ...data, results: data.results.filter((member) => member.user.id !== userId) };
        }
      );
    },
    mutationFn: () =>
      !content?.id
        ? customSkipToken
        : PublisherRepository.removeMember({
            params: {
              publisher_id: content.id,
              user_id: userId,
            },
          }),
  });
};
