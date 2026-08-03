import { useTranslations } from 'next-intl';

import ReloadIcon from '@re/ui-kit/icons/reload';
import { Button } from '@re/ui-kit/ui/button';

import { useSwapBattlepassTask } from '~entities/battlepass/model/mutations';
import type { BattlePassTask } from '~shared/api/models/battlepass';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface BattlepassReplaceTaskProps {
  model: BattlePassTask;
}

export const BattlepassReplaceTask = (props: BattlepassReplaceTaskProps) => {
  const { model } = props;
  const { mutateAsync: swapTask } = useSwapBattlepassTask();
  const t = useTranslations('battlepass.tasks');

  const handleSwapTasks = async () => {
    const toast = await importToastAsync();

    try {
      await swapTask({ task: model.id });
      toast.success(t('swap-tasks-success'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleSwapTasks} disabled={model.claimed || model.progress === model.goal}>
      <ReloadIcon />
    </Button>
  );
};
