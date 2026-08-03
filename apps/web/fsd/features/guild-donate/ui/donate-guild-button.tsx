'use client';
import { useMemo } from 'react';

import Activity from '@re/ui-kit/icons/activity';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { buttonVariants } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { useGuildQuery } from '~entities/guild/model/hooks';
import { CoinsBalance } from '~entities/user/ui/coins-balance';
import { BoostClubForm } from '~features/guild-donate/ui/donate-guild-form';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export const BoostClubButton = ({ className, ...props }: ButtonProps) => {
  const { data: club } = useGuildQuery();

  const coins = useMemo(
    () =>
      club && 'balance' in club
        ? club.balance
        : club?.members.reduce((acc, cur) => {
            acc += cur.coins_spent ?? 0;
            return acc;
          }, 0),
    [club]
  );
  return (
    <Dialog>
      <DialogTrigger
        {...props}
        title="Буст гильдии"
        className={cn(
          buttonVariants({
            color: 'warning',
            size: 'sm',
          }),
          'gap-1 pr-4 pl-2 font-bold',
          className
        )}
      >
        <Activity className="text-foreground dark:text-background" />
        {getAbbreviatedNumber(parseFloat(coins))}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-4">
        <DialogTitle>Буст гильдии</DialogTitle>
        <BoostClubForm actions={<CoinsBalance />} />
      </DialogContent>
    </Dialog>
  );
};
