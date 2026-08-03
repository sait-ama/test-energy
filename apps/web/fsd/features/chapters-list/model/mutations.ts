import type { DefaultError } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { getQueryClient } from '~shared/api/react-query';

import { ChapterViewService } from './service';

const queryClient = getQueryClient();

const setView = ChapterViewService.generateSetView();

export const useSetChapterViewStatus = () =>
  useMutation<void, DefaultError, { chapter_id: number; status: boolean }>({
    mutationFn: (data) => setView(data),
    onSuccess: async (data, error, context) => {
      await queryClient.invalidateQueries({
        exact: true,
        predicate: (query) => resolveInvalidate(options.invalidate, query),
      });
    },
  });
