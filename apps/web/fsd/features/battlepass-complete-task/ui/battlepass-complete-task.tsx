import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';

import { CUSTOM_TASKS } from '~entities/battlepass/model/const';
import { useCheckVkTask, useCompleteBattlepassTask } from '~entities/battlepass/model/mutations';
import type { BattlePassTask } from '~shared/api/models/battlepass';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface BattlepassCompleteTaskProps {
  model: BattlePassTask;
}

export const BattlepassCompleteTask = (props: BattlepassCompleteTaskProps) => {
  const { model } = props;

  const { mutateAsync } = useCompleteBattlepassTask();
  const { mutateAsync: checkVk } = useCheckVkTask();
  const t = useTranslations('battlepass.tasks');

  const isCompleted = model.progress === model.goal;
  const isCustomTask = Object.keys(CUSTOM_TASKS).includes(model.event.toString());

  const handleClaimReward = async () => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({
        task: model.id,
      });
      toast.success(t('completed-successfully'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleCheckVk = async () => {
    const toast = await importToastAsync();

    try {
      await checkVk();
      toast.success(t('completed-successfully-custom', { event: model.event }));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const customTasksResolver: Record<number, () => Promise<void>> = {
    [CUSTOM_TASKS.SUBSCRIBE_VK]: handleCheckVk,
  };

  if (isCustomTask && !isCompleted) {
    return (
      <Button onClick={customTasksResolver[model.event]!}>
        {t('complete-button-custom', { event: model.event })}
      </Button>
    );
  }

  return (
    <Button onClick={handleClaimReward} disabled={!isCompleted || model.claimed}>
      {isCompleted && model.claimed ? t('completed-button') : t('complete-button')}
    </Button>
  );
};
