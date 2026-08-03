import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { cn } from '~shared/utils/cn';

import { useTitlePromoDetailTabs } from '../model/hooks';

export interface TitlePromoDetailTabsProps {
  className?: string;
}

export const TitlePromoDetailTabs = ({ className }: TitlePromoDetailTabsProps) => {
  const { tab, setTab, tabs } = useTitlePromoDetailTabs();

  return (
    <div className={cn('flex justify-between', className)}>
      <Tabs
        activationMode="manual"
        value={tab}
        onValueChange={setTab}
        className="flex w-full justify-between gap-2"
      >
        <TabsList className="cs-tabs-list">
          {tabs.map((it) => (
            <TabsTrigger value={it.value} key={it.value}>
              {it.tLabel}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
