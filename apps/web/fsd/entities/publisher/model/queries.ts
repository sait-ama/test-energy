import { useQuery } from '@tanstack/react-query';

import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherRepository } from '~entities/publisher/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { FormSchema } from '~shared/api/models/forms';
import { FormsTypes } from '~shared/api/models/forms';
import {
  AllRightsResponseSchema,
  Privilege,
  PublisherAdTitlesDetailsParamsSchema,
  PublisherAdTitlesDetailsQuerySchema,
  PublisherAdTitlesDetailsResponseSchema,
  PublisherDirParamsSchema,
  PublisherGetStrikesParamsSchema,
  PublisherGetStrikesRequestSchema,
  PublisherMemberDetailParamsSchema,
  PublisherMemberDetailSchema,
  PublisherQuerySchema,
  PublisherResponseSchema,
  PublisherStatisticParamsSchema,
  PublisherStatisticQuerySchema,
  PublisherStatisticResponseSchemaSerialized,
} from '~shared/api/models/publisher';
import type {
  PublisherActsByContractIdParamsSchema,
  PublisherActsByContractIdResponseSchema,
} from '~shared/api/models/publisher-contract';
import { queryKit } from '~shared/api/react-query';
import { getTypesBaseKey } from '~shared/lib/use-types-base';

export const usePublisherForms = (options: FormSchema<FormsTypes.PUBLISHERS>['get']) =>
  useQuery({
    ...getTypesBaseKey({
      type: FormsTypes.PUBLISHERS,
      get: options,
    }),
  });

export const usePublisherPrivileges = () =>
  (usePublisherForms(['privileges']).data?.content?.privileges || []) as Privilege[];
export const { useQuery: usePublisherQuery, getKey: getPublisherQuery } = queryKit.createQuery<
  EndpointMeta<PublisherDirParamsSchema, PublisherQuerySchema>,
  PublisherResponseSchema
>(({ variables, fetchOptions }) => ({
  queryKey: PublisherQueryKey.getPublisherByDir(variables),
  queryFn: () => PublisherRepository.getPublisherByDir(variables, fetchOptions),
}));

export const { useQuery: usePublisherAdDetailsQuery, getKey: getPublisherAdDetailsQuery } =
  queryKit.createQuery<
    EndpointMeta<PublisherAdTitlesDetailsParamsSchema, PublisherAdTitlesDetailsQuerySchema>,
    PublisherAdTitlesDetailsResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: PublisherQueryKey.getPublisherAdTitlesDetails(variables),
    queryFn: () => PublisherRepository.getPublisherAdTitlesDetails(variables, fetchOptions),
  }));

export const { useQuery: useStrikesQuery, getKey: getStrikesQuery } = queryKit.createQuery<
  EndpointMeta<PublisherGetStrikesParamsSchema, void>,
  PublisherGetStrikesRequestSchema
>(({ variables, fetchOptions }) => ({
  queryKey: PublisherQueryKey.getStrikes(variables),
  queryFn: () => PublisherRepository.getStrikes(variables, fetchOptions),
}));
export const { useQuery: usePublisherMemberDetailQuery, getKey: getPublisherMemberDetailKey } =
  queryKit.createQuery<
    EndpointMeta<PublisherMemberDetailParamsSchema, void>,
    PublisherMemberDetailSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: PublisherQueryKey.MemberDetail.get(variables),
    queryFn: () => PublisherRepository.memberDetail(variables, fetchOptions),
  }));
export const { useQuery: useRightsQuery, getKey: getRightsKey } = queryKit.createQuery<
  never,
  AllRightsResponseSchema
>(() => ({
  queryFn: () => PublisherRepository.rights({}),
  staleTime: Infinity,
  queryKey: PublisherQueryKey.rights,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  gcTime: Infinity,
}));
export const { useQuery: usePublisherActsQuery, getKey: getPublisherActsKey } =
  queryKit.createQuery<
    EndpointMeta<PublisherActsByContractIdParamsSchema, void>,
    PublisherActsByContractIdResponseSchema
  >(({ variables, fetchOptions }) => ({
    queryKey: PublisherQueryKey.Contract.Acts.list.get(variables),
    queryFn: () => PublisherRepository.getActsByContractId(variables, fetchOptions),
  }));

export const { useQuery: usePublisherStatistic, getKey: getPublisherStatistic } =
  queryKit.createQuery<
    EndpointMeta<PublisherStatisticParamsSchema, PublisherStatisticQuerySchema>,
    PublisherStatisticResponseSchemaSerialized
  >(({ variables, fetchOptions }) => {
    return {
      queryKey: PublisherQueryKey.Statistic.get(variables),
      queryFn: () => PublisherRepository.Statistic.get(variables, fetchOptions),
    };
  });
