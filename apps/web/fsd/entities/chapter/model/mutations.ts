import type { DefaultError } from '@tanstack/query-core';

import { v2UsersCurrentRetrieveQueryKey } from '@re/api/generated/@tanstack/react-query.gen';

import type {
  BuyChapterRequestSchema,
  ChapterLikeRequestSchema,
  ChapterViewRequestSchema,
} from '~shared/api/models/chapter';
import { useOptimisticMutation } from '~shared/api/react-query';

import { ChapterQueryKeys } from './query-keys';
import { ChapterRepository } from './repository';

export const useLikeChapter = () =>
  useOptimisticMutation<void, DefaultError, ChapterLikeRequestSchema>({
    invalidate: ({ queryKey }) =>
      queryKey[0] === ChapterQueryKeys.list({})[0] ||
      queryKey[0] === ChapterQueryKeys.detail({})[0],
    mutationFn: (data) => ChapterRepository.like({ data }),
  });

export const useBuyChapter = (options: { chapterId: string }) => {
  return useOptimisticMutation<void, DefaultError, BuyChapterRequestSchema>({
    invalidate: ({ queryKey }) => {
      return (
        queryKey[0] === v2UsersCurrentRetrieveQueryKey({}) ||
        JSON.stringify(queryKey) ===
          JSON.stringify(
            ChapterQueryKeys.detail({
              params: {
                chapter: options.chapterId,
              },
              query: {},
            })
          )
      );
    },
    mutationFn: (data) => ChapterRepository.buy({ data }),
  });
};

export const useChapterView = () =>
  useOptimisticMutation<void, DefaultError, ChapterViewRequestSchema>({
    mutationFn: (data) => ChapterRepository.view({ data }),
  });
