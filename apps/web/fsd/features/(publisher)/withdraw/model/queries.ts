import { PublisherRepository } from '~entities/publisher/model/repository';
import { WithDrawQueryKeys } from '~features/(publisher)/withdraw/model/query-keys';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  CardListResponseSchema,
  PublisherIdParamsSchema,
  PublisherWithDrawListResponseSchema,
} from '~shared/api/models/publisher';
import { queryKit } from '~shared/api/react-query';
import type { PaginationQuerySchema } from '~shared/types/buisines';

export const { useQuery: useConnectedCardQuery, getKey: getConnectedCArdKey } =
  queryKit.createQuery<EndpointMeta<PublisherIdParamsSchema, any>, CardListResponseSchema>(
    ({ variables, fetchOptions }) => ({
      queryKey: WithDrawQueryKeys.Cards.List.get({ params: variables.params }),
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: false,
      queryFn: () => PublisherRepository.getConnectedCards(variables, fetchOptions),
    })
  );
export const { useQuery: useWithDrawListQuery, getKey: getWithDrawListLey } =
  queryKit.createInfiniteQuery<
    EndpointMeta<PublisherIdParamsSchema, PaginationQuerySchema>,
    PublisherWithDrawListResponseSchema
  >(({ variables: { query: { page = 1, count = 15 } = {}, ...otherV } = {}, fetchOptions }) => ({
    initialPageParam: page,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.props.total_pages < lastPageParam ? lastPageParam + 1 : null,
    queryKey: WithDrawQueryKeys.WithDraw.List.get({ ...otherV, query: { page, count } }),
    queryFn: ({ pageParam: page }) =>
      PublisherRepository.withdrawList(
        {
          ...otherV,
          query: { page, count },
        },
        fetchOptions
      ),
  }));
