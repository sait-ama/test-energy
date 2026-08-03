import React, { createContext, ReactNode, useCallback, useState } from 'react';

import type { ActivityService } from '~entities/activity/model/service';
import type { Activity } from '~shared/api/models/activity';
import { useStrictContext } from '~shared/utils/use-strict-context';

export const ActivityListContext = createContext<ActivityService | null>(null);

export const useActivityListContext = () => useStrictContext(ActivityListContext);

interface ActivityItemContext {
  data: Activity;
  isSublist?: boolean;
  isSingleSticker?: boolean;
}

interface ActivityItemActions {
  opensStickerPreview: () => void;
}
export const isActivityWithPinnedState = (data: Activity) => 'is_pinned' in data;
export const ActivityItemContext = createContext<ActivityItemContext | null>(null);
export const ActivityItemBaseStateContext = createContext<ActivityItemActions | null>(null);
export const useActivityItemContext = () => useStrictContext(ActivityItemContext);
const ActivityBaseStateContext = createContext<boolean>();
const ActivityBaseAPIContext = createContext<React.Dispatch<React.SetStateAction<boolean>> | null>(
  () => {}
);
export const ActivityBaseStateProvider = ({ children }: { children: ReactNode }) => {
  const [isSingleSticker, setIsStickerSingle] = useState(false);

  const stableSetState = useCallback((value: React.SetStateAction<boolean>) => {
    setTimeout(() => setIsStickerSingle(value), 0);
  }, []);

  return (
    <ActivityBaseStateContext.Provider value={isSingleSticker}>
      <ActivityBaseAPIContext.Provider value={stableSetState}>
        {children}
      </ActivityBaseAPIContext.Provider>
    </ActivityBaseStateContext.Provider>
  );
};
export const useActivityRemoveAbility = () => useStrictContext(ActivityBaseStateContext);

export const OnlyRemovingActivity = ({ children }: { children: ReactNode }) => {
  const disabled = useActivityRemoveAbility();
  return disabled ? null : <>{children}</>;
};
export const useActivityBaseAPI = () => useStrictContext(ActivityBaseAPIContext);
