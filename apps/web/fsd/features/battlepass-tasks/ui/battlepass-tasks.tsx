'use client';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useBattlepassTasks, useCurrentBattlepass } from '~entities/battlepass/model/queries';
import { TaskCard } from '~entities/battlepass/ui/battlepass-task-card';
import { BattlepassCompleteTask } from '~features/battlepass-complete-task/ui/battlepass-complete-task';
import { BattlepassReplaceTask } from '~features/battlepass-replace-task/ui/battlepass-replace-task';
import type { BattlePassTask } from '~shared/api/models/battlepass';
import { useBoolean } from '~shared/hooks/use-boolean';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export const BattlePassTasks = () => {
  const { data } = useBattlepassTasks({ variables: {} });
  const { data: currentBattlepass } = useCurrentBattlepass({ variables: {} });
  const [isSwapping, toggleSwapping] = useBoolean(false);
  const t = useTranslations('battlepass.tasks');

  const tasks = Object.entries(data?.content)
    .reduce((acc, curr) => {
      const [key, value] = curr;
      const interval = key.replace('Refresh', '').toLowerCase();

      return [...acc, ...value.map((it) => ({ ...it, refresh: interval }))] as BattlePassTask[];
    }, [] as BattlePassTask[])
    .sort((a) => (a.progress === a.goal && !a.claimed ? -1 : 1));

  const FlatList: FlatListType<BattlePassTask[]> = _FlatList;

  const maxSwapsCount = currentBattlepass?.content?.battlepass?.max_swaps_count ?? 0;
  const swapsCount = currentBattlepass?.content?.battlepass?.swaps_count ?? 0;
  const swapsRemaining = maxSwapsCount - swapsCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <ReText color="muted-foreground">
          {t('swap-tasks-counter', { remaining: swapsRemaining, total: maxSwapsCount })}
        </ReText>
        <Button
          onClick={toggleSwapping}
          disabled={swapsRemaining <= 0}
          color={isSwapping ? 'danger' : 'default'}
        >
          {isSwapping ? t('swap-tasks-cancel') : t('swap-tasks-button')}
        </Button>
      </div>

      <FlatList.Root content={tasks} className="w-full">
        <FlatList.Layout className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FlatList.Content>
            {({ item }) => (
              <TaskCard
                key={`${item.name}-${item.id}`}
                model={item}
                action={
                  isSwapping ? (
                    <BattlepassReplaceTask model={item} />
                  ) : (
                    <BattlepassCompleteTask model={item} />
                  )
                }
              />
            )}
          </FlatList.Content>
          <FlatList.Empty
            className="col-span-full"
            text={
              <ReText color="muted-foreground" align="center" className="max-w-80">
                {t('empty-list')}
              </ReText>
            }
            emoji="🎴"
          />
        </FlatList.Layout>
      </FlatList.Root>
    </div>
  );
};
