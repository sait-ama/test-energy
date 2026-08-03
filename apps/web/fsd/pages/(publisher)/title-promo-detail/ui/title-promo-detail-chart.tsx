'use client';
import { memo, useCallback, useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';
import dayjs from 'dayjs';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '~shared/utils/cn';

import { useCurrentPageStatistics } from '../model/store';
import { getCtr, pickEdgeDates } from '../model/utils';

type ChartItemSchema = {
  date: string;
  value: number;
  countLabel: string;
};

const TitlePromoDetailChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Payload<unknown, unknown>;
}) => {
  if (!Array.isArray(payload) || !payload.length) return;
  if (!active) return;

  const data = payload[0].payload as ChartItemSchema;

  return (
    <div className="bg-background border-border rounded-sm border px-3 py-2">
      <ReText weight="medium" align="center" size="sm">
        {data.countLabel}
      </ReText>
      <ReText weight="medium" color="muted-foreground" size="xs" align="center" className="mt-1">
        {dayjs(data.date).format('DD.MM.YYYY')}
      </ReText>
    </div>
  );
};

export interface TitlePromoDetailChartProps {
  syncId: string;
  data: ChartItemSchema[];
  className?: string;
  label: string;
}

export const TitlePromoDetailChart = (props: TitlePromoDetailChartProps) => {
  const { className, syncId, data, label } = props;

  const tDateSelection = useTranslations(
    'publisher-ad-title-page.content.charts.date-selection-labels'
  );

  const [dateSelection, setDateSelection] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const dateSelectionOptions = ['all', 'week', 'month', 'year'] as const;

  const dataInSelection = useMemo(() => {
    const dateEnd = data[data.length - 1]?.date;

    if (dateSelection === 'all' || !dateEnd) return data;

    return data.filter((it) => {
      const currentDate = it.date;

      const diff = dayjs(currentDate).diff(dayjs(dateEnd), dateSelection, true);

      return Math.abs(diff) < 1;
    });
  }, [data, dateSelection]);

  const ticks = useMemo(
    () => pickEdgeDates(dataInSelection.map((it) => it.date)),
    [dataInSelection]
  );

  const tickFormatter = useCallback(
    (date: string) => {
      if (!ticks.length) return '';

      const dateStart = ticks[0];
      const dateEnd = ticks[ticks.length - 1];

      const diffYears = dayjs(dateStart).diff(dayjs(dateEnd), 'year', true);

      return Math.abs(diffYears) > 1
        ? dayjs(date).format('MMMM D, YYYY')
        : dayjs(date).format('MMMM D');
    },
    [ticks]
  );

  return (
    <div className={cn('bg-secondary rounded-md p-4', className)}>
      <div className="flex items-center justify-between">
        <ReText weight="semibold">{label}</ReText>
        <Select value={dateSelection} onValueChange={setDateSelection}>
          <SelectTrigger className="w-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dateSelectionOptions.map((value) => (
                <SelectItem value={value} key={value}>
                  {tDateSelection(value)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={200} className="mt-2">
        <LineChart
          width={500}
          height={200}
          data={dataInSelection}
          syncId={syncId}
          margin={{
            top: 10,
            right: 20,
            left: -10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            vertical={false} // disables vertical lines
            stroke="hsl(var(--r-accent))"
            strokeWidth={2}
          />
          <YAxis tickLine={false} axisLine={false} />
          <XAxis
            tickLine={false}
            dy={16}
            dataKey="date"
            ticks={ticks}
            tickFormatter={tickFormatter}
          />
          <Tooltip content={<TitlePromoDetailChartTooltip />} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--r-primary))"
            strokeWidth="2"
            fill="hsl(var(--r-primary))"
            isAnimationActive={false}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface TitlePromoDetailChartsProps {
  className?: string;
}

export const TitlePromoDetailCharts = memo(({ className }: TitlePromoDetailChartsProps) => {
  const syncId = useId();
  const { data: statistics } = useCurrentPageStatistics();
  const tCharts = useTranslations('publisher-ad-title-page.content.charts');

  const { clickData, viewData, ctrData } = useMemo(() => {
    const clickData = (statistics ?? []).map((it) => {
      const value = it.count_clicks || 0;

      return {
        date: it.date,
        value,
        countLabel: tCharts('labels.n-clicks', { n: value }),
      };
    });

    const viewData = (statistics ?? []).map((it) => {
      const value = it.count_views || 0;

      return {
        date: it.date,
        value,
        countLabel: tCharts('labels.n-views', { n: value }),
      };
    });

    const ctrData = (statistics ?? []).map((it) => {
      const value = getCtr({ views: it.count_views, clicks: it.count_clicks });

      return {
        date: it.date,
        value,
        countLabel: `${value}%`,
      };
    });

    return {
      clickData,
      viewData,
      ctrData,
    };
  }, [statistics]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <TitlePromoDetailChartTooltip />
      <TitlePromoDetailChart label={tCharts('labels.clicks')} syncId={syncId} data={clickData} />
      <TitlePromoDetailChart label={tCharts('labels.views')} syncId={syncId} data={viewData} />
      <TitlePromoDetailChart label="CTR" syncId={syncId} data={ctrData} />
    </div>
  );
});
