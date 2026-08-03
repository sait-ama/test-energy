'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

import { useIsomorphicLayoutEffect } from '@dnd-kit/utilities';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollBar, ShadowScrollArea as ScrollArea } from '@re/ui-kit/ui/shadow-scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsTriggerVariants } from '@re/ui-kit/ui/tabs';
import { cn } from '@re/ui-kit/utils/cn';

import { BackToTitleButton } from '~features/back-to-title-button/ui/back-to-title-button';
import { ForbiddenFields } from '~features/title-form/ui/title-form';
import { useQueryState } from '~shared/hooks/use-query-state-v2';
import { Container } from '~shared/ui/container';
import { ResetSeasonButton } from '~widgets/edit-title-form/ui/reset-season-button';
import { TitleAdditionalFormLinksTab } from '~widgets/edit-title-form/ui/tabs/additional-tab';
import { CreatorsTab } from '~widgets/edit-title-form/ui/tabs/creators-tab';
import { MainTitleEditFormTab } from '~widgets/edit-title-form/ui/tabs/main-tab';
import { PublishersFormTab } from '~widgets/edit-title-form/ui/tabs/publishers-tab';
import { RelatedTitleEditFormTab } from '~widgets/edit-title-form/ui/tabs/related-tab';

const editTitleFormTabs = [
  'base',
  'additional-links',
  'publishers',
  'relations',
  'creators',
] as const;

const getRenderActionsFn = ({ tab }: { tab: (typeof editTitleFormTabs)[number] }) => {
  return ({ isLoading, disabled }: { isLoading: boolean; disabled: boolean }) => (
    <div className="mt-4 flex flex-col justify-between gap-2 md:flex-row">
      <Button type="submit" disabled={disabled || isLoading} className="order-2 md:order-1">
        Отправить на модерацию
      </Button>
      <div className="order-1 flex items-center gap-2 md:order-2">
        <ResetSeasonButton />
        {tab === 'base' && <ForbiddenFields />}
      </div>
    </div>
  );
};
const EditTitleFormContent = ({ tab }: { tab: (typeof editTitleFormTabs)[number] }) => {
  const renderActionsFn = getRenderActionsFn({ tab });
  useIsomorphicLayoutEffect(() => {
    window.scroll(0, 0);
  }, [tab]);
  const baseProps = { children: renderActionsFn };
  switch (tab) {
    case 'base':
      return <MainTitleEditFormTab {...baseProps} key="main" />;
    case 'publishers':
      return <PublishersFormTab {...baseProps} />;
    case 'relations':
      return <RelatedTitleEditFormTab {...baseProps} />;
    case 'creators':
      return <CreatorsTab {...baseProps} />;
    case 'additional-links':
      return <TitleAdditionalFormLinksTab {...baseProps} />;
    default: {
      return null;
    }
  }
};
export const EditTitleFormsPage = () => {
  const t = useTranslations('pages.edit-title-page.content.tabs');
  const [tab, setTab] = useQueryState<string>({ key: 'tab', defaultValue: 'base' });
  return (
    <Container slim className="mt-4">
      <Tabs onValueChange={setTab} className="w-full space-y-4" value={tab} defaultValue={tab}>
        <div className="bg-background sticky top-0 z-[2000] py-2 md:top-[60px]">
          <ScrollArea>
            <TabsList className="w-fit justify-start">
              <BackToTitleButton
                startIcon={<ArrowLeft className="h-4 w-4" />}
                className={cn(tabsTriggerVariants({ size: 'md', variant: 'default' }), 'mb-0')}
              >
                К тайтлу
              </BackToTitleButton>
              {editTitleFormTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {t(tab)}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {editTitleFormTabs.map((tab) => (
          <TabsContent key={tab} className="flex flex-col gap-4" value={tab}>
            <EditTitleFormContent tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </Container>
  );
};
