'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';

import { useIsFirstRender } from '@artsy/fresnel/dist/Utils';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis } from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';

import { usePublisherStatistic } from '~entities/publisher/model/queries';
import type { Field, StatSchema } from '~shared/api/models/publisher';
import { ChartContainer } from '~shared/ui/chart';

dayjs.extend(minMax);

const CustomTooltip = ({
  active,
  payload,
  partials,
}: {
  partials: ChartProps<string>['partials'];
  active?: boolean;
  payload?: Payload<unknown, unknown>;
}) => {
  if (!Array.isArray(payload) || !payload.length) return;
  if (!active) return;
  const { date, ...other } = payload[0].payload;
  return (
    <div className="bg-input rounded-md p-4">
      <ReText size="md">{date}</ReText>
      {Object.keys(partials).map((v) =>
        !partials[v] ? null : (
          <ReText
            key={partials[v]?.label}
            style={{ color: partials[v]?.color }}
          >{`${partials[v]?.label || ''} : ${other[v]}`}</ReText>
        )
      )}
    </div>
  );
};

export const Chart = <TField extends Field>({
  onDataChange,
  fields,
  partials,
  color,
}: ChartProps<TField> & {
  color: string;
  label: string;
}) => {
  'use no memo';

  const { dir: publisherDir } = useParams<{ dir: string }>();
  const form = useFormContext<{ titles: string[]; range: { from: string; to: string } }>();
  const isFirst = useIsFirstRender();
  const partialsArray = Object.keys(partials) as Field[];
  const titles = form.watch('titles') || [];
  const range = form.watch('range') || [];

  const [activeChart, setActiveChart] = useState<keyof StatSchema>(partialsArray[0]);
  const { data, isInitialLoading } = usePublisherStatistic(
    {
      variables: {
        params: { publisherDir },
        query: {
          add: 'titles',
          fields,
          titles: isFirst ? [] : titles,
          date_start: range.from,
          date_end: range.to,
        },
      },
    },
    { enabled: (!!range.to && !!range.from) || (isFirst && !titles) }
  );
  const results = data?.results || {};

  useEffect(() => {
    if (results[fields]?.length) onDataChange(results[fields]);
  }, [data]);

  const chartData = Object.values(results).flat() as StatSchema[];
  useEffect(() => {
    for (const partial of partialsArray) {
      for (const chart of chartData) {
        chart[partials[partial].label] = chart[partial];
      }
    }
  }, [chartData]);

  if (isInitialLoading) return <Skeleton className="h-[455px] w-full" />;
  return (
    <div className="flex flex-col gap-4">
      <ScrollArea>
        <span className="flex gap-4 self-start">
          {partialsArray.length &&
            partialsArray.length > 1 &&
            partialsArray.map((key, i) => {
              const chart = partials[key] as { label: string; color: string };

              if (!chart) return null;

              return (
                <button
                  key={chart.label}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => {
                    setActiveChart(key);
                  }}
                >
                  <span className="text-muted-foreground text-xs">{chart.label}</span>
                </button>
              );
            })}
        </span>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <ChartContainer config={{ total: { label: 'dssd' }, referral_total: { label: 'dsdds' } }}>
        <BarChart
          accessibilityLayer
          data={chartData.map((v) => ({ ...v }))}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
          <Bar dataKey={partials?.[activeChart || 'total'].label || 'total'} fill={color} />
          <Legend verticalAlign="top" height={36} />
          <Tooltip content={<CustomTooltip partials={partials} />} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
