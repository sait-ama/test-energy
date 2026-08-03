import { getTitleDetailKey } from '~entities/title/model/queries';
import { getQueryClient } from '~shared/api/react-query';

export const prefetchCurrentPageTitleDetail = (dir: string) => {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(getTitleDetailKey({ variables: { params: { dir } } }));
  return queryClient;
};

export const getCurrentPageTitleDetail = async (dir: string) => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(
    getTitleDetailKey({
      variables: { params: { dir } },
      fetchOptions: {
        cache: 'no-cache',
      },
    })
  );
};
