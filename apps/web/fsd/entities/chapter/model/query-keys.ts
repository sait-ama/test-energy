import type { ChaptersPaginatedListQuerySchema } from '~shared/api/models/chapter';
import { queryKit } from '~shared/api/react-query';

export namespace ChapterQueryKeys {
  export const list = queryKit.createQueryKey<void, ChaptersPaginatedListQuerySchema>(
    (variables) => ['chapters-list', variables]
  );
  export const detail = queryKit.createQueryKey((variables) => ['chapter-detail', variables]);
  export const last = queryKit.createQueryKey(() => ['chapter-last']);
}
