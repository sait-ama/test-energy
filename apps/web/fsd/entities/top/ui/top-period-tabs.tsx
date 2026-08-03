'use client';
import Link from 'next/link';

import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useContentType } from '~app/providers/site-config-provider';
import { useTopParams } from '~entities/top/model/hooks';
import { Routing } from '~shared/config/routing';

export const periods = [
  {
    name: 'new',
    label: 'Новинок',
  },
  {
    name: 'monthly',
    label: 'Месяца',
  },
  {
    name: 'year',
    label: 'Года',
  },
];

export const TopPeriodTabs = () => {
  const contentType = useContentType();
  const { period, tab } = useTopParams();

  return (
    <Tabs defaultValue={period} className="mt-2">
      <TabsList variant="pill" size="sm">
        {periods.map((period) => (
          <TabsTrigger key={period.name} value={period.name} asChild>
            <Link
              prefetch={false}
              href={Routing.Title.top({
                params: {
                  content: contentType,
                  tab,
                },
                query: { period: period.name },
              })}
            >
              {period.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
