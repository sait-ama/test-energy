import {
  QueryKey,
  v2InventoryItemsMomentsRetrieveInfiniteQueryKey,
  v2TitlesMomentsCatalogListInfiniteQueryKey,
  v2TitlesMomentsCreateMutation,
  v2TitlesMomentsDestroyMutation,
} from '@re/api/generated/@tanstack/react-query.gen';
import { Options } from '@re/api/generated/sdk.gen';
import type { DefaultError } from '@tanstack/query-core';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { reV2TitlesMomentsListQueryKey } from '~entities/moment/model/query-keys';
import { TitleKeys } from '~entities/title/model/query-keys';
import { TitleRepository } from '~entities/title/model/repository';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type { ChaptersPaginatedListQuerySchema } from '~shared/api/models/chapter';
import type {
  AddSimilarTitleParamsSchema,
  AddSimilarTitleRequestSchema,
  AddTitleToBookmarksRequestSchema,
  MomentPaginatedListResponseSchema,
  PurchaseBundleRequestSchema,
  RemoveTitleFromBookmarksRequestSchema,
  ScoreSimilarTitlesRequestSchema,
  SetRatingRequestSchema,
  TitleBundlesParamsSchema,
  TitleBundlesQuerySchema,
  TitleChaptersActionsRequestSchema,
} from '~shared/api/models/title';
import { useOptimisticMutation, withClientOptions } from '~shared/api/react-query';

export const useSetTitleRating = () =>
  useOptimisticMutation<void, DefaultError, SetRatingRequestSchema>({
    mutationFn: (data) => TitleRepository.setRating({ data }),
  });

export const useScoreSimilarTitle = () =>
  useOptimisticMutation<void, DefaultError, ScoreSimilarTitlesRequestSchema>({
    mutationFn: (data) => TitleRepository.similarScore({ data }),
    invalidate: ({ queryKey }) => queryKey[0] === TitleKeys.similar({})[0],
  });

export const useTitleChapterActions = (
  variables: EndpointMeta<void, ChaptersPaginatedListQuerySchema>
) =>
  useOptimisticMutation<void, DefaultError, TitleChaptersActionsRequestSchema>({
    mutationFn: (data) => TitleRepository.titleChapterActions({ data }),
    invalidate: TitleKeys.titleChapters(variables),
  });

export const useAddTitleBundle = (
  variables: EndpointMeta<void, ChaptersPaginatedListQuerySchema>
) =>
  useOptimisticMutation<void, DefaultError, any>({
    mutationFn: (data) => TitleRepository.addTitleBundle({ ...variables, data }),
    invalidate: TitleKeys.titleChapters(variables),
  });

export const useTitleAddSimilar = (variables: EndpointMeta<AddSimilarTitleParamsSchema, void>) =>
  useOptimisticMutation<void, DefaultError, AddSimilarTitleRequestSchema>({
    mutationFn: (data) => TitleRepository.addSimilar({ data, ...variables }),
    invalidate: ({ queryKey }) => queryKey[0] === TitleKeys.similar({})[0],
  });

export const usePurchaseBundle = (
  variables: EndpointMeta<TitleBundlesParamsSchema, TitleBundlesQuerySchema>
) =>
  useOptimisticMutation<void, DefaultError, PurchaseBundleRequestSchema>({
    mutationFn: (data) => TitleRepository.purchaseBundle({ data }),
    invalidate: TitleKeys.titleBundles(variables),
  });
export const useAddTitleToBookmarks = () =>
  useOptimisticMutation<void, DefaultError, AddTitleToBookmarksRequestSchema>({
    mutationFn: (data) => TitleRepository.addToBookmarks({ data }),
    // invalidate: UserKeys.historyByUserId(variables),
  });
export const useRemoveTitleFromBookmarks = () =>
  useOptimisticMutation<void, DefaultError, RemoveTitleFromBookmarksRequestSchema>({
    mutationFn: (data) => TitleRepository.removeFromBookmarks({ data }),
    // invalidate: UserKeys.historyByUserId(variables),
  });

export const useCreateMoment = () =>
  useOptimisticMutation(v2TitlesMomentsCreateMutation(withClientOptions({})));

export const useCreateNote = (variables: EndpointMeta<any, void>) =>
  useOptimisticMutation<void, DefaultError, any>({
    mutationFn: (data) => TitleRepository.noteCreate({ data, ...variables }),
    invalidate: ({ queryKey }) => queryKey[0] === TitleKeys.retrieve({})[0],
  });
export const useRemoveMoment = () => {
  const queryClient = useQueryClient();
  return useOptimisticMutation({
    ...v2TitlesMomentsDestroyMutation(withClientOptions({})),
    onSuccess: (_, { path: { moment_dir } = {} }) => {
      setTimeout(() => {
        queryClient.setQueriesData<InfiniteData<MomentPaginatedListResponseSchema>>(
          {
            predicate: ({ queryKey }: { queryKey: QueryKey<Options> }) => {
              const [{ _id: uniq }] = queryKey;
              const [{ _id: titleCatalogMomentsId }] = v2TitlesMomentsCatalogListInfiniteQueryKey();
              const [{ _id: listMomentsId }] = reV2TitlesMomentsListQueryKey();
              const [{ _id: inventoryListId }] = v2InventoryItemsMomentsRetrieveInfiniteQueryKey({
                path: { user_id: NaN },
              });
              return (
                uniq === titleCatalogMomentsId || uniq === listMomentsId || uniq === inventoryListId
              );
            },
          },
          (v) => {
            if (!v) return v;
            return {
              pages: v.pages.map((page) => ({
                ...page,
                results: page.results.filter(({ dir }) => dir !== moment_dir),
              })),
              pageParams: v.pageParams,
            };
          }
        );
      }, 0);
    },
  });
};
