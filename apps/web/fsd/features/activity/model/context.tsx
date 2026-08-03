import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';

import type { ActivityItemState } from '~features/activity/model/types';
import type {
  ActivityPaginatedListQuerySchema,
  ActivityPaginatedListResponseSchema,
  ActivityTargetQuerySchema,
  CommentSchema,
} from '~shared/api/models/activity';
import { useStrictContext } from '~shared/utils/use-strict-context';

type CallbackUpdate = (c: Partial<CommentSchema>) => Partial<CommentSchema>;

export interface MutateActions {
  getData(): ActivityPaginatedListResponseSchema | undefined;

  getParams(): {
    target: ActivityTargetQuerySchema;
    query: ActivityPaginatedListQuerySchema<ActivityTargetQuerySchema>;
  };

  invalidate(): Promise<any>;

  cancel(): Promise<void>;

  add(): Promise<void> | void;

  update(id: NumberIsomorphic | undefined, comment: Partial<CommentSchema> | CallbackUpdate): void;

  remove(id: NumberIsomorphic): void;
}

export const ActivityListActionsContext = createContext<MutateActions | null>(null);
export interface ActivityItemActionsContextType {
  state: ActivityItemState;
  setState: Dispatch<SetStateAction<ActivityItemState>>;
  isSublist?: boolean;
  sublistActions?: MutateActions;
  registerSublistActions: (actions: MutateActions) => () => void;
}
export const ActivityItemActionsContext = createContext<ActivityItemActionsContextType | null>(
  null
);

export const useActivityListActionsContext = () => useStrictContext(ActivityListActionsContext);
export const useActivityItemActionsContext = () => useStrictContext(ActivityItemActionsContext);
