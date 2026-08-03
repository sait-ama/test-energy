'use client';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import type { TitleDetailSchema } from '~shared/api/models/title';
import { TestProps } from '~shared/lib/test/utils/test-props';

import { TabVisibilityControl } from '../model/ability';
import { TitleDetailPageTabs, TitleDetailPageTabsList } from '../model/const';
import { useCurrentPageSuspenseTitleDetail } from '../model/queries';
import { useTitleTabs } from '../model/store';

interface TabCountProps {
  count_field?: string;
  title?: TitleDetailSchema;
  tab: string;
}

const TabCount = (props: TabCountProps) => {
  const { tab, title, count_field } = props;

  if (tab === TitleDetailPageTabs.CHAPTERS && title?.meta.is_forbidden_by_country) return null;

  const count = count_field ? title?.[count_field] : null;

  if (!count) return null;

  return ` (${count})`;
};

export const TitleTabsListBlock = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const { tab, setTab } = useTitleTabs();
  const contentType = useContentType();
  const { features } = useSiteConfig();

  return (
    <ScrollArea>
      <Tabs defaultValue={tab} onValueChange={setTab} activationMode="manual" className="flex-[1]">
        <TabsList
          className="dark:bg-background/50 flex-[1]"
          // className="dark:bg-background/50 flex-[1]"

          {...TestProps.id('title-tabs')}
        >
          {TitleDetailPageTabsList.filter((tab) => {
            if (tab.feature && !features[tab.feature]) return false;
            if (!tab.exclude) return true;

            return tab.exclude !== contentType;
          }).map(({ name, value, count_field }) => (
            <TabVisibilityControl key={value} tab={value}>
              <TabsTrigger
                {...TestProps.id(`${value}_tab_btn`)}
                value={value}
                disabled={value === TitleDetailPageTabs.CHAPTERS && !title?.count_chapters}
              >
                {name}
                <TabCount count_field={count_field} title={title} tab={value} />
              </TabsTrigger>
            </TabVisibilityControl>
          ))}
          <ScrollBar orientation="horizontal" hidden />
        </TabsList>
      </Tabs>
    </ScrollArea>
  );
};
