import type { PublisherIdParamsSchema } from '~shared/api/models/publisher';
import { queryKit } from '~shared/api/react-query';
import type { PaginationQuerySchema } from '~shared/types/buisines';

export namespace WithDrawQueryKeys {
  export namespace WithDraw {
    export namespace List {
      export const UNIQUE_PART = 'publisher-withdraw-list';
      export const get = queryKit.createQueryKey<
        PublisherIdParamsSchema,
        PaginationQuerySchema,
        typeof UNIQUE_PART
      >(({ params }) => [UNIQUE_PART, { params }]);
    }
  }
  export namespace Cards {
    export namespace List {
      export const UNIQUE_PART = 'publisher-connected-cards';
      export const get = queryKit.createQueryKey<PublisherIdParamsSchema, void, typeof UNIQUE_PART>(
        ({ params }) => [UNIQUE_PART, { params }]
      );
    }
  }
}
