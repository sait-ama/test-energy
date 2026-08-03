import { useCallback, useState } from 'react';

import { ActivityRepository } from '~entities/activity/model/repository';
import type {
  ActivityPaginatedListBaseQuerySchema,
  ActivityPaginatedListQuerySchema,
  ActivityTargetQuerySchema,
  QueryFn,
} from '~shared/api/models/activity';

const useQueryState = <T>(externalQuery: T) => {
  const [query, setQuery] = useState<T>(externalQuery);

  const handleSetQuery = useCallback(
    (params) => {
      if (!params) return;
      setQuery((query) => ({ ...query, ...params }));
    },
    [setQuery]
  ) as (params: Partial<T>) => void;

  return [query, handleSetQuery] as const;
};

export type UseActivityServiceOptions<
  Target extends ActivityTargetQuerySchema,
  GetUrlFunc extends QueryFn,
> = {
  queryFn: GetUrlFunc;
  target: Target;
  queryProp: ActivityPaginatedListBaseQuerySchema;
};

export const useActivityService = <
  Target extends ActivityTargetQuerySchema,
  GetUrlFunc extends QueryFn,
>({
  queryFn,
  target,
  queryProp,
}: UseActivityServiceOptions<Target, GetUrlFunc>) => {
  const [query, setQuery] = useQueryState<ActivityPaginatedListBaseQuerySchema>(queryProp || {});

  return {
    queryFn,
    repository: ActivityRepository,
    target,
    query,
    setQuery,
    isSublist: false,
  } as unknown as ActivityService<Target>;
};

export interface ActivityService<T extends ActivityTargetQuerySchema = ActivityTargetQuerySchema> {
  queryFn: QueryFn;
  repository: typeof ActivityRepository;
  target: T;
  query: ActivityPaginatedListQuerySchema<T>;
  setQuery: (params: Partial<ActivityPaginatedListQuerySchema<T>>) => void;
  isSublist: boolean;
}
