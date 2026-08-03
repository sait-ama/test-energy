import { parseAsStringEnum, useQueryState } from 'nuqs';

import { UserBillingTab } from './const';

export const useUserBillingTab = () =>
  useQueryState(
    'tab',
    parseAsStringEnum(Object.values(UserBillingTab)).withDefault(UserBillingTab.MONEY)
  );
