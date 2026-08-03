import { useCallback, useMemo } from 'react';

import { useCurPublisherDeps } from '~entities/publisher/model/context';
import { useRemoveCard } from '~features/(publisher)/withdraw/model/mutations';
import { useConnectedCardQuery } from '~features/(publisher)/withdraw/model/queries';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { getError } from '~shared/lib/form/error-handling-base';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useConnectedCards = () => {
  const publisherId = useCurPublisherDeps((v) => v.publisherId);

  const {
    data: { content: cards = [] } = {},
    isLoading: isCardLoading,
    error,
  } = useConnectedCardQuery(
    { variables: { params: { id: publisherId } } },
    { enabled: !!publisherId /* && ability.can('read', 'withdraw')*/ }
  );
  const { mutateAsync, isPending: isRemovePending } = useRemoveCard({ publisherId: publisherId });

  const deleteCard = useCallback(async (cardId: number) => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ card_id: cardId });
      toast.success(`Карта была успешно отвязана`);
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  }, []);
  return useMemo(
    () => ({
      error: error ? getError(error) : undefined,
      cards,
      isRemovePending,
      isCardLoading,
      deleteCard,
    }),
    [cards, isCardLoading, isRemovePending, error]
  );
};
