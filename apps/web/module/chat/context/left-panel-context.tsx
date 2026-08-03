import { createContext } from '@re/core/utils/create-context';

export enum LeftPanelView {
  CHANNELS_LIST = 'channels_list',
  NEW_CHAT = 'new_chat',
  NEW_CHANNEL = 'new_channel',
}

export type LeftPanelContextValue = {
  /**
   * Current view displayed in the left panel
   */
  currentView: LeftPanelView;
  /**
   * Set the current view in the left panel
   */
  setCurrentView: (view: LeftPanelView) => void;
};

export const {
  useStore: useLeftPanelContext,
  Provider: LeftPanelProvider,
  Context: LeftPanelContext,
} = createContext<LeftPanelContextValue, LeftPanelContextValue>((v) => v, 'LeftPanelContext');
