'use client';
import type { ReactNode } from 'react';

import { useMoneyAbility } from '~features/(publisher)/withdraw/model/ability';
import { useCancelWithDraw } from '~features/(publisher)/withdraw/model/mutations';
import type { PublisherWithDrawSchema } from '~shared/api/models/publisher';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const CancelWithdraw = <Model extends Pick<PublisherWithDrawSchema, 'id' | 'sum'>>({
  children,
  model,
}: {
  model: Model;
  children: (cancel: () => void, isPending?: boolean) => ReactNode;
}) => {
  const { mutateAsync, isPending } = useCancelWithDraw();
  const ability = useMoneyAbility();
  const cancelWithDraw = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ sum: model.sum, id: model.id });
      toast.success('Вывод успешно отклонён');
    } catch (e) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };
  if (!ability.can('create', 'withdraw')) return null;

  return children(cancelWithDraw, isPending);
};
