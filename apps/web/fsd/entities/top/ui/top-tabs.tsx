'use client';
import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useTopParams } from '~entities/top/model/hooks';
import { TopTabSchemaFragment } from '~shared/api/models/top';
import { Routing } from '~shared/config/routing';
import { withQuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

type TopTypeTabsProps = {
  tabs: TopTabSchemaFragment[];
  className?: string;
};

export const TopTypeTabs = withQuerySuspenseContainer<TopTypeTabsProps>(
  (props: TopTypeTabsProps) => {
    const { tabs = [] } = props;
    const contentType = useContentType();
    const { period, tab } = useTopParams();

    const tabsArr = [{ label: 'Все', dir: 'all', id: 'all' }, ...tabs];

    return (
      <Tabs defaultValue={tab} className="max-w-full">
        <ScrollArea>
          <TabsList variant="pill" size="md">
            {tabsArr.map((tab) => (
              <TabsTrigger key={tab.id} value={String(tab.id)} asChild>
                <Link
                  prefetch={false}
                  href={Routing.Title.top({
                    params: {
                      content: contentType,
                      tab: tab.id,
                    },
                    query: { period },
                  })}
                >
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" hidden />
        </ScrollArea>
      </Tabs>
    );
  },
  <div className="flex w-full max-w-full justify-center gap-2">
    {new Array(8).fill(0).map((_, i) => (
      <Skeleton key={i} className={cn('h-10 rounded-md opacity-70', getSkeletonWidth(i))} />
    ))}
  </div>,
  ({ resetErrorBoundary }) => (
    <div className="flex flex-row p-1">
      <Button onClick={resetErrorBoundary}>Обновить</Button>
    </div>
  )
);

function getSkeletonWidth(index: number) {
  if (index === 0) return 'w-20';
  if (index === 1) return 'w-32';
  if (index === 2) return 'w-36';
  if (index === 3) return 'w-40';
  if (index === 4) return 'w-28x';
  if (index === 5) return 'w-40';
  if (index === 6) return 'w-32';
  if (index === 7) return 'w-40';
  return 'w-32';
}
