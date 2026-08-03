import { queryKit } from '~shared/api/react-query';

import type {
  ChannelByIdParamsSchema,
  ChannelMessagesPaginatedListParamsSchema,
  ChannelMessagesPaginatedListQuerySchema,
  GetChannelsPaginatedListQuerySchema,
} from './types';

export namespace ChatQueryKeys {
  export namespace Channel {
    export namespace ById {
      export const UNIQUE_PART = 'channel';
      export const get = queryKit.createQueryKey<
        Partial<ChannelByIdParamsSchema>,
        void,
        typeof UNIQUE_PART
      >((variables) => [UNIQUE_PART, { authDepend: true, ...variables }]);
    }
    export namespace List {
      export const UNIQUE_PART = 'channels';
      export const get = queryKit.createQueryKey<
        void,
        GetChannelsPaginatedListQuerySchema,
        typeof UNIQUE_PART
      >((variables) => [UNIQUE_PART, { authDepend: true, ...variables }]);
    }
  }
  export namespace ChatMessages {
    export namespace List {
      export const UNIQUE_PART = 'messages';
      export type QueryType = [
        typeof UNIQUE_PART,
        {
          params: ChannelMessagesPaginatedListParamsSchema;
          query: ChannelMessagesPaginatedListQuerySchema;
          authDepend: true;
        },
      ];
      export const get = queryKit.createQueryKey<
        Partial<ChannelMessagesPaginatedListParamsSchema>,
        Partial<ChannelMessagesPaginatedListQuerySchema>
      >((variables) => [UNIQUE_PART, { authDepend: true, ...variables }]);
    }
  }
}
