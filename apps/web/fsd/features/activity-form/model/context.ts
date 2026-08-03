import { createContext } from 'react';

import { useStrictContext } from '~shared/utils/use-strict-context';

export type ActivityFormState = {
  state: {
    isOpened: boolean;
    isMarkdownToolbarShown: boolean;
  };
  disabled?: boolean;
  actions: {
    openEmojiPreview?: () => void;
    toggleMarkdownToolbarShown: () => void;
    toggleIsOpened: () => void;
    closeIsOpened: () => void;
    onCancel?: () => void;
  };
};
// todo!!!
export const ActivityFormStateContext = createContext<ActivityFormState | null>(null);
export const ActivityFormRootCompoundSubmitDeps = createContext<{
  compoundOnSubmit: () => void;
} | null>(null);
export const useCompoundActivityDeps = () => useStrictContext(ActivityFormRootCompoundSubmitDeps);
export const useActivityFormStateContext = () => useStrictContext(ActivityFormStateContext);
