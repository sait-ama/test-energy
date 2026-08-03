import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardTitle } from '@re/ui-kit/ui/card';
import { ReText } from '@re/ui-kit/ui/text';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@re/ui-kit/ui/tooltip';

import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export interface Values {
  avg: number;
  total: number;
}

export interface CommonStatStore {
  days: Values;
  payments: Values;
  donates: Values;
  bookmarks: Values;
  referrals: Values;
  views: Values;
  votes: Values;
}

interface StateProps {
  stat: keyof CommonStatStore;
  values: Values;
}

const Stat = memo(({ stat, values }: StateProps) => {
  const t = useTranslations('publisher.segments.profile-layout.statistic.stats');

  if (!values) return null;
  const parsedAvg = parseInt(String(values.avg), 10);
  return (
    <Card className="flex flex-col gap-4 p-4" variant="ghost" style={{ textAlign: 'center' }}>
      <CardTitle>{t(stat)}</CardTitle>
      <CardContent className="flex flex-col items-center gap-2">
        <ReText size="md"> {values.total ? getAbbreviatedNumber(values.total) : 0} </ReText>
        <ReText size="xs">
          {!parsedAvg || isNaN(parsedAvg) ? (
            '---'
          ) : (
            <>{t('per-day', { avg: getAbbreviatedNumber(parsedAvg) })}</>
          )}
        </ReText>
      </CardContent>
    </Card>
  );
});

const ReferralStat = ({ stat, values }: StateProps) => {
  if (!values) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Stat stat={stat} values={values} />
        </TooltipTrigger>
        <TooltipContent>
          Получить реферальную ссылку можно в настройках, раздел монетизация
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const TotalStats = memo(({ stats }: { stats: CommonStatStore }) => {
  if (!stats) return null;
  const statsKeyArray = Object.keys(stats) as (keyof CommonStatStore)[];
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {statsKeyArray.map((stat) => {
          const Component = stat === 'referrals' ? ReferralStat : Stat;
          return <Component key={stat} stat={stat} values={stats[stat]} />;
        })}
      </div>
    </div>
  );
});
