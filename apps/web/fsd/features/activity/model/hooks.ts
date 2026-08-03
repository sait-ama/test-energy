import { useActivityItemActionsContext } from '~features/activity/model/context';

export const useIsItemDeleting = () => {
  const { state } = useActivityItemActionsContext();

  return state.isDeleting;
};

export const useIsItemUpdating = () => {
  const { state } = useActivityItemActionsContext();

  return state.isUpdating;
};
