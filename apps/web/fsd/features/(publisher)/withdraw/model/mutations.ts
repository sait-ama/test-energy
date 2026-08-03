import { useParams } from 'next/navigation';

import type { DefaultError } from '@tanstack/query-core';

import { BillingRepository } from '~entities/billing/model/repository';
import { useCurPublisherDeps } from '~entities/publisher/model/context';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherRepository } from '~entities/publisher/model/repository';
import type {
  getLinkingCardsForWindow,
  removeConnectedCard,
} from '~features/(publisher)/withdraw/model/actions';
import { WithDrawQueryKeys } from '~features/(publisher)/withdraw/model/query-keys';
import type { WithDrawRequestSchema } from '~shared/api/models/billing';
import type { CardListResponseSchema, PublisherResponseSchema } from '~shared/api/models/publisher';
import { getQueryClient, useOptimisticMutation } from '~shared/api/react-query';

export const useCreateWithDrawMutation = (publisherId: number) =>
  useOptimisticMutation<void, DefaultError, Omit<WithDrawRequestSchema, 'publisher'>>({
    mutationFn: (data) =>
      BillingRepository.createWithDraw({ data: { ...data, publisher: publisherId } }),
  });

export const useConnectCardForWindowProcessQuery = () => {
  const id = useCurPublisherDeps((v) => v.publisherId);
  return useOptimisticMutation<
    V1Response<any, never>,
    DefaultError,
    Parameters<typeof getLinkingCardsForWindow>[0]['data']
  >({
    mutationFn: () => PublisherRepository.connectCard({ params: { id }, data: {} }),
  });
};
export const useCancelWithDraw = () => {
  const queryClient = getQueryClient();
  const { dir } = useParams();
  return useOptimisticMutation<void, DefaultError, { sum: string; id: number }>({
    invalidate: ({ queryKey }) => queryKey[0] === WithDrawQueryKeys.WithDraw.List.UNIQUE_PART,
    onSuccess: (_, { sum }) => {
      queryClient.setQueryData<PublisherResponseSchema>(
        PublisherQueryKey.getPublisherByDir({ params: { dir } }),
        (v) =>
          !v
            ? v
            : {
                ...v,
                content: {
                  ...v.content,
                  balance: String(parseFloat(v.content.balance) + parseFloat(sum)),
                },
              }
      );
    },
    mutationFn: ({ id }) => PublisherRepository.cancelWithdraw({ params: { id } }),
  });
};
export const useRemoveCard = ({ publisherId }: { publisherId: number }) =>
  useOptimisticMutation<void, DefaultError, Parameters<typeof removeConnectedCard>[0]['data']>({
    mutationFn: (data) => PublisherRepository.removeCard({ params: { id: publisherId }, data }),
    // await removeConnectedCard({ params: { id: publisherId }, data });
    onSuccess: (_, variables) => {
      getQueryClient().setQueriesData<CardListResponseSchema>(
        {
          predicate: ({ queryKey }) =>
            queryKey.length === 2 && queryKey[0] === WithDrawQueryKeys.Cards.List.UNIQUE_PART,
        },
        (v) =>
          !v ? v : { ...v, content: v.content.filter((card) => card.id !== variables?.card_id) }
      );
    },
  });
