import { ComponentProps, ReactNode, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { billingTabs, UserBillingTab } from '~pages/(user)/user-billing/model/const';
import { useUserBillingTab } from '~pages/(user)/user-billing/model/hooks';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { useDebouncedCallback } from '@re/core/hooks/use-debounced-callback';

interface UserBillingHeaderProps extends ComponentProps<'div'> {
  subheader?: ReactNode;
  title?: ReactNode;
}

export const UserBillingHeader = ({ className, title, subheader }: UserBillingHeaderProps) => {
  const t = useTranslations('user-billing-page');

  const [tab, _setTab] = useUserBillingTab();
  const handleTabChange = useCallback(async (value: string) => {
    await _setTab(value as UserBillingTab);
  }, []);
  const setTab = useDebouncedCallback(handleTabChange, 100);
  return (
    <div className={cn('mt-[155px] flex max-w-[395px] flex-col justify-center gap-10', className)}>
      <ReText align="center" className="z-[1000] md:text-[60px]" weight="bold" size="3xl">
        {title || t('title')}
      </ReText>
      {subheader}

      <Tabs
        value={tab}
        activationMode="manual"
        onValueChange={setTab}
        className={cn('flex w-full justify-center gap-2', className)}
      >
        <ScrollArea>
          <TabsList size="md" className="max-sm:pl-4">
            {billingTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!!tab.disabled}
                {...TestProps.id('profile_tab_btn')}
              >
                {t(`segments.${tab.id}.title`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>
    </div>
  );
};
