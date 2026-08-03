import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { ExternalLinkIcon } from '@re/ui-kit/icons/external-link';
import { ReText } from '@re/ui-kit/ui/text';
import dayjs from 'dayjs';

import { getDateFields, getStatisticsFields } from '~features/(publisher)/promo/model/utils';
import { cn } from '~shared/utils/cn';

import {
  useCurrentPageActivePromo,
  useCurrentPagePromo,
  useTitlePromoDetailTabs,
} from '../model/hooks';
import { useCurrentPageStatistics } from '../model/store';

interface TitlePromoDetailStatsProps {
  className?: string;
}

export const TitlePromoDetailStats = ({ className }: TitlePromoDetailStatsProps) => {
  const tStats = useTranslations('publisher-ad-title-page.content.stats.labels');

  const { tab, setTab } = useTitlePromoDetailTabs();

  const { data: statistics } = useCurrentPageStatistics();

  const currentPromo = useCurrentPagePromo();
  const activePromo = useCurrentPageActivePromo();

  const promo = tab === 'all' ? activePromo : currentPromo;

  const { statisticsFields, dateFields } = useMemo(() => {
    const statisticsFields = getStatisticsFields(
      (statistics ?? []).map((it) => ({
        clicks: it.count_clicks ?? 0,
        views: it.count_views ?? 0,
      }))
    );
    const dateFields = getDateFields({
      dateStart: promo?.date_start ?? '',
      dateEnd: promo?.date_end ?? '',
    });

    return { statisticsFields, dateFields };
  }, [statistics, promo]);

  const options = useMemo(
    () => [
      {
        value: statisticsFields.viewsToday,
        tLabel: 'views-today',
        Icon: null,
      },
      {
        value: statisticsFields.clicksToday,
        tLabel: 'clicks-today',
        Icon: null,
      },
      {
        value: `${statisticsFields.ctrToday}%`,
        tLabel: 'ctr-today',
        Icon: null,
      },
      {
        value: dateFields.daysSpent,
        tLabel: 'day-spent',
        Icon: null,
      },
      {
        value: statisticsFields.viewsOverall,
        tLabel: 'views-overall',
        Icon: null,
      },
      {
        value: statisticsFields.clicksOverall,
        tLabel: 'clicks-overall',
        Icon: null,
      },
      {
        value: `${statisticsFields.ctrOverall}%`,
        tLabel: 'ctr-overall',
        Icon: null,
      },
      {
        value: dateFields.daysLeft,
        tLabel: 'days-left',
        Icon: null,
      },
    ],
    []
  );

  return (
    <div className={cn('bg-secondary rounded-md p-4', className)}>
      <div className="flex flex-wrap items-center gap-7">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{tStats('status')}:</span>
          <span
            className={cn(
              'group bg-accent inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 font-semibold',
              dateFields.isActive ? 'text-success' : 'text-danger'
            )}
          >
            {dateFields.isActive ? tStats('status-active') : tStats('status-inactive')}{' '}
            {tab === 'all' && activePromo ? (
              <ExternalLinkIcon
                onClick={() => setTab(String(activePromo.id))}
                className="group-hover:opacity-70"
              />
            ) : null}
          </span>
        </div>
        {promo?.date_start ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{tStats('date-start')}:</span>
            <span className="font-semibold">{dayjs(promo.date_start).format('DD.MM.YYYY')}</span>
          </div>
        ) : null}
        {promo?.date_end ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{tStats('date-end')}:</span>
            <span className="font-semibold">{dayjs(promo.date_end).format('DD.MM.YYYY')}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {options.map((it) => (
          <div className="border-border rounded-md border p-4" key={it.tLabel}>
            <p>{it.Icon}</p>
            <ReText className="mt-1" color="muted-foreground" weight="medium" size="md">
              {`${tStats(it.tLabel)}:`}
            </ReText>
            <ReText className="mt-1" weight="semibold" size="lg">
              {it.value}
            </ReText>
          </div>
        ))}
      </div>
    </div>
  );
};
