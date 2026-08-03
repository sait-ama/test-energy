import cloneDeep from 'lodash.clonedeep';

import type { useChaptersListInfinite } from '~entities/chapter/model/queries';
import { ChapterQueryKeys } from '~entities/chapter/model/query-keys';
import { ChapterRepository } from '~entities/chapter/model/repository';
import { getQueryClient } from '~shared/api/react-query';
import { debounce } from '~shared/utils/debounce';

const queryClient = getQueryClient();

export class ChapterActionsService {
  static createSetView = ({
    onActualSuccess,
    onActualError,
  }: {
    onActualSuccess?: () => void;
    onActualError?: (e: unknown) => void;
  }) => {
    const deleteSet = new Set<number>();
    const addSet = new Set<number>();

    const requestHandler = debounce(() => {
      const viewPromise =
        addSet.size > 0
          ? ChapterRepository.viewMultiple({ data: { chapter_ids: Array.from(addSet) } })
          : null;
      const unviewPromise =
        deleteSet.size > 0
          ? ChapterRepository.unviewMultiple({ data: { chapter_ids: Array.from(deleteSet) } })
          : null;

      Promise.all([viewPromise, unviewPromise])
        .then(onActualSuccess, onActualError)
        .finally(() => {
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === ChapterQueryKeys.list({})[0],
          });
        });

      deleteSet.clear();
      addSet.clear();
    }, 500);

    const setView = ({ chapter_id, status }: { chapter_id: number; status: boolean }) => {
      if (status) {
        // if adding
        deleteSet.has(chapter_id) ? deleteSet.delete(chapter_id) : addSet.add(chapter_id);
      } else {
        // if deleting
        addSet.has(chapter_id) ? addSet.delete(chapter_id) : deleteSet.add(chapter_id);
      }

      queryClient.setQueriesData(
        {
          predicate: (query) => query.queryKey[0] === ChapterQueryKeys.list({})[0],
        },
        (data) => {
          const actualData = data as ReturnType<typeof useChaptersListInfinite>['data'];

          if (!actualData) return data;

          for (let pageIndex = 0; pageIndex < actualData?.pages.length; pageIndex++) {
            const pageData = actualData?.pages[pageIndex]!;

            for (let itemIndex = 0; itemIndex < pageData.results.length; itemIndex++) {
              const itemData = pageData.results[itemIndex]!;

              if (itemData.id == chapter_id && itemData.viewed !== status) {
                const dataCopy = cloneDeep(actualData);

                dataCopy.pages[pageIndex]!.results[itemIndex]!.viewed = status;

                return dataCopy;
              }
            }
          }

          return data;
        }
      );

      requestHandler();

      // or generate add/delete promises for actual responses?
      return Promise.resolve();
    };

    return setView;
  };

  static createSetLike = ({
    onActualSuccess,
    onActualError,
  }: {
    onActualSuccess?: () => void;
    onActualError?: (e: unknown) => void;
  }) => {
    const chapters = new Set<number>();

    const requestHandler = debounce(() => {
      ChapterRepository.like({ data: { chapter_ids: Array.from(chapters) } })
        .then(onActualSuccess, onActualError)
        .finally(() => {
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === ChapterQueryKeys.list({})[0],
          });
        });
      chapters.clear();
    }, 500);

    const setLike = ({ chapter }: { chapter: number }) => {
      chapters.add(chapter);

      queryClient.setQueriesData(
        {
          predicate: (query) => query.queryKey[0] === ChapterQueryKeys.list({})[0],
        },
        (data) => {
          const actualData = data as ReturnType<typeof useChaptersListInfinite>['data'];

          if (!actualData) return data;

          for (let pageIndex = 0; pageIndex < actualData?.pages.length; pageIndex++) {
            const pageData = actualData?.pages[pageIndex]!;

            for (let itemIndex = 0; itemIndex < pageData.results.length; itemIndex++) {
              const itemData = pageData.results[itemIndex]!;

              if (itemData.id == chapter) {
                const dataCopy = cloneDeep(actualData);
                dataCopy.pages[pageIndex]!.results[itemIndex]!.rated = 1;

                return dataCopy;
              }
            }
          }

          return data;
        }
      );

      requestHandler();

      // or generate promises for actual responses?
      return Promise.resolve();
    };

    return setLike;
  };
}
