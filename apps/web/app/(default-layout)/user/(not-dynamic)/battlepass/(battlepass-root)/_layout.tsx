'use client';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { parse } from '@nimpl/path-parser';

import { Progress } from '@re/ui-kit/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useBattlepassPreview, useCurrentBattlepass } from '~entities/battlepass/model/queries';
import {
  BattlePassInfo,
  BattlepassInfoPreview,
  BattlepassJoin,
} from '~features/battlepass-info/ui/battlepass-info';
import { Routing } from '~shared/config/routing';

const BattlepassProgress = () => {
  const { data } = useCurrentBattlepass();

  const { content } = data;
  const { battlepass, levels } = content;

  const expPerLevel = battlepass.battlepass.exp_per_level ?? 1000;
  const totalExp = levels.length * expPerLevel;

  return (
    <div className="flex w-full items-center gap-2 whitespace-nowrap md:max-w-108">
      <Progress value={(100 * battlepass.exp) / totalExp} className="w-full" />
      <span className="text-muted-foreground">
        {battlepass.exp} / {totalExp}
      </span>
      EXP
    </div>
  );
};

export const BattlepassPageLayout = ({ children }: { children: ReactNode }) => {
  const { data: preview } = useBattlepassPreview();
  const pathname = usePathname();
  const { tab } = parse(
    pathname,
    '(default-layout)/user/(not-dynamic)/battlepass/(battlepass-root)/[tab]'
  ) as {
    tab: string;
  };
  const t = useTranslations('battlepass.tabs');

  if (!preview?.content.user_has_bp) {
    return <BattlePassInfo topSlot={<BattlepassInfoPreview />} bottomSlot={<BattlepassJoin />} />;
  }

  return (
    <>
      <BattlepassInfoPreview />
      <Tabs
        value={tab}
        className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between"
      >
        <TabsList>
          <TabsTrigger value="info" asChild>
            <Link prefetch={false} href={Routing.User.Battlepass.info()}>
              {t('info')}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="tasks" asChild>
            <Link prefetch={false} href={Routing.User.Battlepass.tasks()}>
              {t('tasks')}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="rewards" asChild>
            <Link prefetch={false} href={Routing.User.Battlepass.rewards()}>
              {t('rewards')}
            </Link>
          </TabsTrigger>
        </TabsList>
        <BattlepassProgress />
      </Tabs>
      {children}
    </>
  );
};
