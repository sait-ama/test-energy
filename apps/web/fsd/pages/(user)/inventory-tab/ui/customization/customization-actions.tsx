'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import { useTranslations } from 'use-intl';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@re/ui-kit/ui/select';

import { customizationTabs, InventoryTab } from '~pages/(user)/inventory-tab/model/const';
import { useCustomizationType } from '~pages/(user)/inventory-tab/ui/customization/model/state';
import { useSession } from '~shared/lib/session/use-session';

const validateTabs = (isLogged: boolean, isCurrent: boolean) => {
  return customizationTabs.filter(({ currentOnly, loggedOnly }) => {
    if (currentOnly) {
      if (!isCurrent) return false;
    }
    if (loggedOnly) {
      if (!isLogged) return false;
    }
    return true;
  });
};
export const CustomizationActions = () => {
  const [tab = InventoryTab.AVATARS, setTab] = useCustomizationType();
  const t = useTranslations('user.pages.inventory.tabs');
  const userId = +useParams<{ id: string }>()?.id;
  const sessionId = useSession((v) => v?.id);
  const isCurrentUser = userId === sessionId;
  const tabs = useMemo(() => validateTabs(!!sessionId, isCurrentUser), [sessionId, isCurrentUser]);

  return (
    <Select<InventoryTab>
      onValueChange={(value) => setTab(value)}
      value={tab}
      defaultValue={InventoryTab.AVATARS}
    >
      <SelectTrigger className="!h-9 w-fit">{t(tab)}</SelectTrigger>
      <SelectContent>
        {tabs.map((tab) => (
          <SelectItem key={tab.tab} value={tab.tab}>
            {t(tab.tab)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
