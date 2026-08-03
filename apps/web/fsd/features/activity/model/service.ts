import { useEffect, useMemo } from 'react';

import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { useActivityItemContext, useActivityListContext } from '~entities/activity/model/context';
import { ActivityKeys } from '~entities/activity/model/query-keys';
import type { MutateActions } from '~features/activity/model/context';
import { useActivityItemActionsContext } from '~features/activity/model/context';
import type { ActivityPaginatedListResponseSchema } from '~shared/api/models/activity';

export const useActivityActionsService = () => {
  const queryClient = useQueryClient();
  const { target, query } = useActivityListContext();

  const variables = { query: { ...query }, params: target };

  const actions = useMemo(
    (): MutateActions => ({
      getParams: () => ({ target, query }),
      getData: () => queryClient.getQueryData(ActivityKeys.activity(variables)),
      invalidate: () =>
        queryClient.invalidateQueries({
          queryKey: ActivityKeys.activity(variables),
        }),
      cancel: () => queryClient.cancelQueries({ queryKey: ActivityKeys.activity(variables) }),
      add: () =>
        queryClient.invalidateQueries({
          queryKey: ActivityKeys.activity(variables),
        }),
      update: (id, comment) => {
        const cid = id;

        if (!cid) return;

        queryClient.setQueryData<InfiniteData<ActivityPaginatedListResponseSchema>>(
          ActivityKeys.activity(variables),
          (data) => {
            const pages = data?.pages;

            if (pages?.length) {
              const newPages: ActivityPaginatedListResponseSchema[] = [];

              for (const page of pages) {
                const index = page.results.findIndex((c) => c.id === cid);
                if (index !== -1) {
                  const newPage = { results: [...page.results] };
                  const data =
                    typeof comment === 'function' ? comment(page.results[index]) : comment;
                  newPage.results[index] = { ...page.results[index], ...data };
                  newPages.push(newPage);
                } else {
                  newPages.push(page);
                }
              }

              return { pageParams: [], ...data, pages: newPages };
            }
            return data;
          }
        );
      },
      remove: () =>
        queryClient.invalidateQueries({
          queryKey: ActivityKeys.activity(variables),
        }),
    }),
    [target, query, queryClient]
  );

  return actions;
};

export const useActionsSublistConnect = (initialActions: MutateActions) => {
  const { update } = initialActions;
  const { registerSublistActions } = useActivityItemActionsContext();
  const { data } = useActivityItemContext();

  useEffect(() => registerSublistActions(initialActions), [initialActions, registerSublistActions]);

  const syncActions = useMemo(
    (): MutateActions => ({
      ...initialActions,
      //todo @overload
      add: () => {
        update(data.id, ({ count_replies = 0 }) => ({
          count_replies: count_replies + 1,
        }));
        initialActions.add();
      },
      remove: (id) => {
        update(data.id, ({ count_replies }) => ({
          count_replies: count_replies ? count_replies - 1 : count_replies,
        }));
        initialActions.remove(id);
      },
    }),
    [initialActions, data.id]
  );

  return syncActions;
};
