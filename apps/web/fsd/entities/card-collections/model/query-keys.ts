import {
  DEFAULT_INITIAL_PAGE,
  DEFAULT_ORDERING,
  DEFAULT_PAGE_SIZE,
} from '~entities/card-collections/model/const';
import {
  CardCollectionPaginatedListParamsSchema,
  CardCollectionPaginatedListQuerySchema,
} from '~shared/api/models/card-collections';
import { queryKit } from '~shared/api/react-query';

export namespace QueryKeys {
  export namespace List {
    export const UNIQUE_PART = 'user-collection-cards-paginated-list' as const;
    export const get = queryKit.createQueryKey<
      CardCollectionPaginatedListParamsSchema,
      CardCollectionPaginatedListQuerySchema,
      typeof UNIQUE_PART
    >((variables) => [
      UNIQUE_PART,
      {
        authDepend: true,
        ...variables,
        query: {
          ...variables.query,
          page: variables?.query?.page || DEFAULT_INITIAL_PAGE,
          count: variables?.query?.count || DEFAULT_PAGE_SIZE,
          ordering: variables?.query?.ordering || DEFAULT_ORDERING,
        },
      },
    ]);
  }
  export namespace One {
    export const UNIQUE_PART = 'user-collection-card-retrieve';
    export const get = queryKit.createQueryKey<CardCollectionPaginatedListParamsSchema, void>(
      (variables) => [UNIQUE_PART, { authDepend: true, ...variables }]
    );
  }
}
