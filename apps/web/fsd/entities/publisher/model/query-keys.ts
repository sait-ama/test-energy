import type {
  PublisherAdTitlesDetailsParamsSchema,
  PublisherAdTitlesDetailsQuerySchema,
  PublisherAdTitlesListParamsSchema,
  PublisherAdTitlesListQuerySchema,
  PublisherDirParamsSchema,
  PublisherGetStrikesParamsSchema,
  PublisherMemberDetailParamsSchema,
  PublisherMembersListParamsSchema,
  PublisherQuerySchema,
  PublisherStatisticParamsSchema,
  PublisherStatisticQuerySchema,
  PublisherTitleSelectOptionsParamsSchema,
  PublisherTitleSelectOptionsQuerySchema,
} from '~shared/api/models/publisher';
import type {
  CollaborationTypesQuerySchema,
  PublisherActsByContractIdParamsSchema,
  PublisherContractParamsSchema,
  PublisherContractQuerySchema,
} from '~shared/api/models/publisher-contract';
import { queryKit } from '~shared/api/react-query';
import type { AppQueryKey } from '~shared/types/react-query';

export namespace PublisherQueryKey {
  export const rights = ['publisher-rights', {}] as AppQueryKey;
  export namespace Statistic {
    export const UNIQUE_PART = 'publisher-statistic';
    export const get = queryKit.createQueryKey<
      PublisherStatisticParamsSchema,
      PublisherStatisticQuerySchema,
      typeof UNIQUE_PART
    >((v) => [UNIQUE_PART, { authDepend: true, ...v }]);
  }
  export namespace Contract {
    export namespace Acts {
      export namespace list {
        export const UNIQUE_PART = 'publisher-acts';
        export const get = queryKit.createQueryKey<
          PublisherActsByContractIdParamsSchema,
          void,
          typeof UNIQUE_PART
        >((variables) => [UNIQUE_PART, { ...variables, authDepend: true }]);
      }
    }
    export namespace Fields {
      export const getUniquePart = () => 'publisher-contract';
      export const get = queryKit.createQueryKey<
        PublisherContractParamsSchema,
        PublisherContractQuerySchema
      >(({ query: { ...query } = {}, ...variable }) => [
        getUniquePart(),
        {
          ...query,
          ...variable,
          authDepend: true,
        },
      ]);
    }

    export namespace CollaborationTypes {
      export const UniquePart = 'publisher-collaboration-types';
      export const get = queryKit.createQueryKey<void, CollaborationTypesQuerySchema>(
        (variables) => ['publisher-ad-title-detail', { ...variables, authDepend: true }]
      );
    }
  }
  export namespace MemberDetail {
    export const UniquePart = 'member-detail';
    export const get = queryKit.createQueryKey<PublisherMemberDetailParamsSchema, void>(
      (variables) => [
        UniquePart,
        {
          ...variables,
          authDepend: true,
        },
      ]
    );
  }
  export const getPublisherByDir = queryKit.createQueryKey<
    PublisherDirParamsSchema,
    PublisherQuerySchema
  >((variables) => ['publisher', { ...variables, authDepend: true }]);

  export const getPublisherAdTitlesDetails = queryKit.createQueryKey<
    PublisherAdTitlesDetailsParamsSchema,
    PublisherAdTitlesDetailsQuerySchema
  >((variables) => ['publisher-ad-title-detail', { ...variables, authDepend: true }]);

  export const getPublisherAdTitlesList = queryKit.createQueryKey<
    PublisherAdTitlesListParamsSchema,
    PublisherAdTitlesListQuerySchema
  >((variables) => ['ad-titles-list', { ...variables, authDepend: true }]);

  export const membersByPublisherId = queryKit.createQueryKey<
    PublisherMembersListParamsSchema,
    void
  >((variables) => ['members-list', { ...variables, authDepend: true }]);

  export const titleSelectOptions = queryKit.createQueryKey<
    PublisherTitleSelectOptionsParamsSchema,
    PublisherTitleSelectOptionsQuerySchema
  >((variables) => ['title-select-options', { ...variables, authDepend: true }]);

  export const getStrikes = queryKit.createQueryKey<PublisherGetStrikesParamsSchema, void>(
    ({ query, params: { publisherId, ...params } = {} }) => [
      'publisher-strikes',
      { query, params: { ...params, publisherId: String(publisherId) }, authDepend: true },
    ]
  );
}
