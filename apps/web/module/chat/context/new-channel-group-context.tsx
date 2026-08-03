import { createContext } from '@re/core/utils/create-context';

import { UserSchemaFragment } from '~shared/api/models/user';

export enum NewChannelGroupStep {
  SELECT_USERS = 'SELECT_USERS',
  CHANNEL_GROUP_DETAILS = 'CHANNEL_GROUP_DETAILS',
}

/**
 * Context state values
 */
type NewChannelGroupState = {
  /**
   * Current step in the new channel group creation flow
   */
  currentStep: NewChannelGroupStep;
  /**
   * Selected users to add to the channel group
   */
  selectedUsers: UserSchemaFragment[];
  /**
   * Search query for finding users
   */
  searchQuery: string;
  /**
   * New channel group name
   */
  channelGroupName: string;
  /**
   * Channel group image URL or File object
   */
  channelGroupImage: string | File | null;
  /**
   * Loading state for channel group creation
   */
  isCreating: boolean;
  /**
   * Error state for channel group creation
   */
  createError: Error | null;
};

/**
 * Context action methods
 */
type NewChannelGroupActions = {
  /**
   * Move to the next step in channel group creation
   */
  nextStep: () => void;
  /**
   * Go back to the previous step
   */
  prevStep: () => void;
  /**
   * Reset the flow to the initial state
   */
  resetFlow: () => void;
  /**
   * Add a user to the selected users list
   */
  addSelectedUser: (user: UserSchemaFragment) => void;
  /**
   * Remove a user from the selected users list
   */
  removeSelectedUser: (user: UserSchemaFragment) => void;
  /**
   * Clear all selected users
   */
  clearSelectedUsers: () => void;
  /**
   * Update the search query
   */
  setSearchQuery: (query: string) => void;
  /**
   * Update the channel group name
   */
  setChannelGroupName: (name: string) => void;
  /**
   * Update the channel group image
   */
  setChannelGroupImage: (image: string | File | null) => void;
  /**
   * Create the channel group with the current settings
   */
  createChannelGroup: (
    data?: Partial<{
      name: string;
      cover: string | File | null;
      member_ids: number[];
    }>
  ) => Promise<void>;
};

export type NewChannelGroupContextValue = NewChannelGroupState & NewChannelGroupActions;

export const {
  useStore: useNewChannelGroupContext,
  Provider: NewChannelGroupProvider,
  Context: NewChannelGroupContext,
} = createContext<NewChannelGroupContextValue, NewChannelGroupContextValue>(
  (v) => v,
  'NewChannelGroupContext'
);
