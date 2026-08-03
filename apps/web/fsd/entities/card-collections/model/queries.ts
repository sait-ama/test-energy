import { QueryKeys } from '~entities/card-collections/model/query-keys';
import { CardCollectionsRepository } from '~entities/card-collections/model/repository';
import { EndpointMeta } from '~shared/api/api-toolkit';
import {
  CardCollectionRetrieveParamsSchema,
  CardCollectionRetrieveResponseSchema,
} from '~shared/api/models/card-collections';
import { queryKit } from '~shared/api/react-query';

export const { getKey: getCardRetrieveQueryKey } = queryKit.createSuspenseQuery<
  EndpointMeta<CardCollectionRetrieveParamsSchema, void>,
  CardCollectionRetrieveResponseSchema
>(({ variables, fetchOptions }) => ({
  queryFn: () => CardCollectionsRepository.one({ params: variables.params! }, fetchOptions),
  queryKey: QueryKeys.One.get(variables),
}));

export enum CollectionType {
  EXCHANGEABLE = 'exchangeable',
  TITLE = 'title',
  USER = 'user',
}
