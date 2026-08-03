'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { z } from 'zod';

import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { usePublisherStatistic } from '~entities/publisher/model/queries';
import { useChartConfig } from '~pages/(publisher)/stats-table/model/use-chart-config';
import { Chart } from '~pages/(publisher)/stats-table/ui/chart';
import type { CommonStatStore } from '~pages/(publisher)/stats-table/ui/publisher-all-stats';
import { TotalStats } from '~pages/(publisher)/stats-table/ui/publisher-all-stats';
import type { Field, StatSchema } from '~shared/api/models/publisher';
import { Calendar } from '~shared/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { Section, SectionTitle } from '~shared/ui/section';
import { NArray } from '~shared/utils/NArray';

dayjs.extend(minMax);

dayjs.locale('ru');

const initialState = {
  startDate: dayjs().add(-14, 'day').toDate(),
  endDate: new Date(),
};
export const PublisherStatistic = () => {
  const { dir: publisherDir } = useParams<{ dir: string }>();
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);
  const chartConfig = useChartConfig();
  const t = useTranslations('publisher.segments.profile-layout.statistic.filter');
  const { data } = usePublisherStatistic({
    variables: {
      params: { publisherDir },
      query: {
        add: 'titles',
        fields: 'payments',
        date_end: dayjs(initialState.endDate).format('DD.MM.YYYY'),
        date_start: dayjs(initialState.startDate).format('DD.MM.YYYY'),
      },
    },
  });
  const meta = data?.meta;

  const titles = meta?.titles || [];
  const defaultValues = {
    range: { from: meta?.date_start, to: meta?.date_end },
    titles: titles.map((v) => String(v.id)),
  };
  const form = useForm({
    schema: z.object({
      range: z.object({ to: z.string().datetime().optional(), from: z.string().datetime() }),
      titles: z.string().array(),
    }),
    defaultValues,
  });
  const [state, setState] = useState<CommonStatStore | {}>({});

  function calculateStats(
    data: StatSchema[] = [],
    fieldNames:
      | 'payments'
      | 'donates'
      | 'referrals'
      | ('views' | 'payments' | 'donates' | 'referrals')[],
    totalNames: (keyof Omit<StatSchema, 'date'>)[]
  ) {
    const totals = Array.isArray(totalNames) ? totalNames : [totalNames];
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    if (!fields.length || !totals.length || !data.length) return;
    const newStats = { ...state, days: { total: data.length } };
    for (let j = 0; j < fields.length; j++) {
      newStats[fields[j]] = { total: 0, avg: 0 };
    }
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < fields.length; j++) {
        if (data[i][totals[j]]) newStats[fields[j]].total += data[i][totals[j]];
      }
    }
    for (let j = 0; j < fields.length; j++) {
      if (newStats[fields[j]].total && newStats.days.total)
        newStats[fields[j]].avg = newStats[fields[j]].total / newStats.days.total;
    }
    setState((stats) => ({ ...stats, ...newStats }));
  }

  useEffect(() => {
    form.reset({ ...defaultValues });
  }, [data]);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <span className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="titles"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('title-filter')}</FormLabel>
                <FormControl>
                  <MultiSelector values={field.value ?? []} onValuesChange={field.onChange}>
                    <MultiSelectorTrigger
                      className="h-12"
                      labelResolver={NArray.newBy(titles).recordBy(
                        (it) => it.id,
                        (it) => it.name
                      )}
                    >
                      <MultiSelectorInput />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {titles.map((it) => (
                          <MultiSelectorItem
                            className="lineClamp-1"
                            value={String(it.id)}
                            key={it.id}
                          >
                            {it.name}
                          </MultiSelectorItem>
                        ))}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            render={({ field }) => {
              const from = field.value.from ? field.value.from : undefined;
              const to = field.value.to ? field.value.to : undefined;
              return (
                <FormItem>
                  <FormLabel>{t('date-interval')}</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input
                          className="h-12"
                          readOnly
                          value={`${from || t('date-placeholder')} - ${to || t('date-placeholder')}`}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <FormControl>
                          <Calendar
                            // locale={{ code: 'ru-RU' }}
                            captionLayout="dropdown-buttons"
                            mode="range"
                            selected={{
                              from: !field.value.from
                                ? undefined
                                : dayjs(field.value.from, dateFormat).toDate(),
                              to: !field.value.to
                                ? undefined
                                : dayjs(field.value.to, dateFormat).toDate(),
                            }}
                            onSelect={(dateRange) => {
                              const { from, to } = dateRange ?? {};
                              field.onChange({
                                from: !from ? undefined : dayjs(from).format(dateFormat),
                                to: !to ? undefined : dayjs(to).format(dateFormat),
                              });
                            }}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            toYear={dayjs().year() + 1}
                            fromYear={dayjs().year()}
                          />
                        </FormControl>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              );
            }}
            name="range"
          />
        </span>
        <TotalStats stats={state as CommonStatStore} />
        <div className="flex flex-col gap-4">
          {(Object.keys(chartConfig) as Field[]).map((v, i) => {
            return (
              <Section key={i}>
                <SectionTitle>{chartConfig[v].label}</SectionTitle>
                {/*{useMemo(*/}
                {/*    () => (*/}
                <Chart
                  key={v}
                  onDataChange={(data) => {
                    calculateStats(
                      data,
                      chartConfig[v].allStatsArgs.fields,
                      chartConfig[v].allStatsArgs.totals
                    );
                  }}
                  isLoading={!data}
                  color={chartConfig[v].color}
                  label={chartConfig[v].label}
                  fields={v}
                  partials={chartConfig[v].partials}
                />
              </Section>
            );
          })}
        </div>
      </Form>
    </div>
  );
};
