import type { DefaultError } from '@tanstack/query-core';
import { useMutation } from '@tanstack/react-query';

import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherRepository } from '~entities/publisher/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import {
  PublisherActivateAdParamsSchema,
  PublisherAddDaysRequestSchema,
  PublisherAdTitlesDetailsQuerySchema,
  PublisherAdTitlesListParamsSchema,
  type PublisherAdTitlesListQuerySchema,
  PublisherBuyAdDaysParamsSchema,
  PublisherBuyAdDaysRequestSchema,
  PublisherBuyAdDaysResponseSchema,
  PublisherContractorParamsSchema,
  PublisherContractorRequestSchema,
  PublisherDirParamsSchema,
  PublisherQuerySchema,
} from '~shared/api/models/publisher';
import type {
  PublisherAddPromoParamsSchema,
  PublisherManualWithdrawRequestSchema,
} from '~shared/api/models/publisher-contract';
import { useOptimisticMutation } from '~shared/api/react-query';

export const useAddDays = (params: PublisherAddPromoParamsSchema) =>
  useMutation({
    mutationFn: () => PublisherRepository.addDays({ params }),
  });

export const useBuyDays = (params: PublisherBuyAdDaysParamsSchema) =>
  useMutation<PublisherBuyAdDaysResponseSchema, DefaultError, PublisherBuyAdDaysRequestSchema>({
    mutationFn: (data) => PublisherRepository.buyDays({ params, data }),
  });

export const useActivateAd = (
  variables: EndpointMeta<PublisherActivateAdParamsSchema, PublisherAdTitlesDetailsQuerySchema>
) =>
  useOptimisticMutation({
    mutationFn: (data) => PublisherRepository.activateAdCall({ ...variables, data }),
    invalidate: PublisherQueryKey.getPublisherAdTitlesDetails(variables),
  });

export const useDeactivateAd = (variables) =>
  useOptimisticMutation({
    mutationFn: (data) => PublisherRepository.deactivateAdCall({ ...variables, data }),
    invalidate: PublisherQueryKey.getPublisherAdTitlesDetails(variables),
  });

export const useManualWithdraw = (
  variables: EndpointMeta<PublisherDirParamsSchema, PublisherQuerySchema>
) =>
  useOptimisticMutation<void, DefaultError, PublisherManualWithdrawRequestSchema>({
    mutationFn: (data) => PublisherRepository.manualWithdraw({ data }),
    invalidate: PublisherQueryKey.getPublisherByDir(variables),
  });

export const useAddAdTitle = (
  variables: EndpointMeta<PublisherAdTitlesListParamsSchema, PublisherAdTitlesListQuerySchema>
) =>
  useOptimisticMutation({
    mutationFn: PublisherRepository.addAdTitleCall,
    invalidate: PublisherQueryKey.getPublisherAdTitlesList(variables),
  });

export const useCreateContractor = (
  variables: EndpointMeta<PublisherContractorParamsSchema, void>
) =>
  useOptimisticMutation<void, DefaultError, PublisherContractorRequestSchema>({
    mutationFn: (data) => PublisherRepository.createContractor({ ...variables, data }),
  });

export const usePublisherUpdate = () =>
  useOptimisticMutation({
    mutationFn: PublisherRepository.changeByDir,
  });

export const useAddPromoDays = () =>
  useOptimisticMutation<void, DefaultError, PublisherAddDaysRequestSchema>({
    mutationFn: (data) => PublisherRepository.addPromoDays({ data }),
  });
