'use client';

import { useState } from 'react';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { AddCardAutoForm } from '~features/add-card-auto/ui/add-card-auto-form';
import type { CreateInventoryCardFormSchema } from '~features/add-card-manual/model/validators';
import { AddCardManualForm } from '~features/add-card-manual/ui/add-card-manual-form';
import { AddCardManualFormActions } from '~features/add-card-manual/ui/add-card-manual-form-actions';
import { Features } from '~shared/config/feature-flags';

export interface CardAddFormProps {
  defaultValues?: Partial<CreateInventoryCardFormSchema>;
  disabled?: boolean;
}

enum CREATE_CARD_MODE {
  MANUAL = 'manual',
  AUTO = 'auto',
}

export const CardAddPage = (props: CardAddFormProps) => {
  'use no memo';
  const [tab, setTab] = useState<CREATE_CARD_MODE>(CREATE_CARD_MODE.MANUAL);
  const { features } = useSiteConfig();

  return (
    <>
      <Tabs onValueChange={(v) => setTab(v as CREATE_CARD_MODE)} defaultValue={tab}>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="w-full">
            <ScrollArea>
              <TabsList className="justify-start">
                <TabsTrigger value={CREATE_CARD_MODE.MANUAL}>Ручное</TabsTrigger>
                <TabsTrigger disabled={!features[Features.CARD_GEN]} value={CREATE_CARD_MODE.AUTO}>
                  Автоматическое
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          {tab === CREATE_CARD_MODE.MANUAL ? (
            <AddCardManualFormActions className="self-start" />
          ) : null}
        </div>

        <TabsContent value={CREATE_CARD_MODE.MANUAL}>
          <AddCardManualForm {...props} />
        </TabsContent>
        <TabsContent value={CREATE_CARD_MODE.AUTO}>
          <AddCardAutoForm {...props} />
        </TabsContent>
      </Tabs>
    </>
  );
};
