import { useCallback } from 'react';

import confetti from 'canvas-confetti';
import { useTranslations } from 'use-intl';

import { ShortCardItem, UserRareCollection } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';

import { canExchangeCollection } from '~entities/card-collections/model/utils';
import { useHeroCardPreviewModalStore } from '~entities/inventory/model/stores';
import { DoExchange } from '~features/(collection-card)/ui/do-exchange';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';

interface ExchangeButtonProps {
  model: UserRareCollection;
}

const resolveStatus2I18nKey = ({
  isPending,
  isSuccess,
}: {
  isPending: boolean;
  isSuccess: boolean;
}) => {
  if (isPending) {
    return 'pending';
  }
  if (isSuccess) return 'success';
  return 'idle';
};

export const ExchangeButton = ({ model: item }: ExchangeButtonProps) => {
  const tCard = useTranslations('collections');
  const openModal = useHeroCardPreviewModalStore((v) => v.openModal);

  const onExchangeSuccess = useCallback(
    async (card: ShortCardItem) => {
      openModal(card);
      useInfoModal.getState().close();
      confetti();
    },
    [openModal]
  );
  const canExchange = canExchangeCollection(item);
  return (
    <DoExchange onSuccess={onExchangeSuccess} key={item.id} collectionId={item.id}>
      {(isPending, isSuccess) => (
        <Button
          disabled={isPending || isSuccess || !canExchange}
          loading={isPending}
          variant={!canExchange ? 'secondary' : 'default'}
        >
          {tCard(
            `exchangeable-item.actions.exchange-progress.${resolveStatus2I18nKey({ isSuccess, isPending })}`
          )}
        </Button>
      )}
    </DoExchange>
  );
};
