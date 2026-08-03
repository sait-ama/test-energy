import queryString from 'query-string';

import type { ToolkitEndpointBuilder } from '~shared/api/api-toolkit';
import type { WithDrawByIdParamsSchema } from '~shared/api/models/billing';
import {
  PublisherActivateAdParamsSchema,
  PublisherAdTitlesDetailsParamsSchema,
  PublisherAdTitlesDetailsQuerySchema,
  PublisherAdTitlesListParamsSchema,
  PublisherAdTitlesListQuerySchema,
  PublisherBuyAdDaysParamsSchema,
  PublisherContractorParamsSchema,
  PublisherDeactivateAdParamsSchema,
  PublisherDirParamsSchema,
  PublisherGetStrikesParamsSchema,
  PublisherIdParamsSchema,
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
  PublisherAddPromoParamsSchema,
  PublisherContractParamsSchema,
  PublisherContractQuerySchema,
  PublisherContractSendFileParamsSchema,
} from '~shared/api/models/publisher-contract';
import type { PaginationQuerySchema } from '~shared/types/buisines';
import { UrlBuilder } from '~shared/utils/url-formatter';

//     };
export namespace PublisherEndpoints {
  export const rights = () => '/api/v2/publishers/rights/';

  export namespace ByDir {
    export const change: ToolkitEndpointBuilder<PublisherDirParamsSchema, void> = ({ params }) =>
      `/api/publishers/${params!.dir}/`;
    export const exit: ToolkitEndpointBuilder<PublisherIdParamsSchema, void> = ({ params }) =>
      `/api/v2/publishers/${params!.id}/members/exit/`;
  }
  export namespace Statistic {
    export const get: ToolkitEndpointBuilder<
      PublisherStatisticParamsSchema,
      PublisherStatisticQuerySchema
    > = ({ params, query: { date_end, date_start, titles = [], fields, add } = {} }) => {
      return new UrlBuilder(`/api/publishers/${params?.publisherDir!}/statistics/`)
        .query({ date_end, date_start, titles: titles.join(','), fields, add })
        .build();
    };
  }
  export namespace Member {
    export const detail: ToolkitEndpointBuilder<PublisherMemberDetailParamsSchema, void> = ({
      params: { id, memberId } = {},
    }) => `/api/v2/publishers/${id}/members/${memberId}/`;
  }

  export namespace WithDraw {
    export const base: ToolkitEndpointBuilder<WithDrawByIdParamsSchema, void> = ({
      params: { id } = {},
    }) => new UrlBuilder(`/api/billing/withdraw/${id!}/`).build();
    export const list: ToolkitEndpointBuilder<PublisherIdParamsSchema, PaginationQuerySchema> = ({
      params: { id } = {},
      query,
    }) => new UrlBuilder(`/api/publishers/${id!}/withdraw/`).query(query).build();
  }

  export namespace Contract {
    export const actsByContract: ToolkitEndpointBuilder<
      PublisherActsByContractIdParamsSchema,
      any
    > = ({ params: { contractId } = {} }) =>
      new UrlBuilder(`/api/publishers/contracts/${contractId!}/acts/`).build();
    export const downloadAct: ToolkitEndpointBuilder<
      PublisherActsByContractIdParamsSchema,
      any
    > = ({ params: { contractId } = {} }) =>
      new UrlBuilder(`/api/publishers/contracts/${contractId!}/acts/download`).build();
    export const postContractFile: ToolkitEndpointBuilder<
      PublisherContractSendFileParamsSchema,
      void
    > = ({ params }) => `/api/publishers/${params!.publisherId}/contract-files/`;
    export const postContract: ToolkitEndpointBuilder<PublisherContractParamsSchema, void> = ({
      params,
    }) => new UrlBuilder(`/api/publishers/${params!.publisherId}/contract/`).build();
    export const getContractFields: ToolkitEndpointBuilder<
      PublisherContractParamsSchema,
      PublisherContractQuerySchema
    > = ({ query, params }) =>
      new UrlBuilder(`/api/publishers/${params!.publisherId}/contract/`)
        .query({ collaboration_type: query?.collaboration_type, country: query?.country })
        .build();
  }

  export const collaborationTypes: ToolkitEndpointBuilder<void, CollaborationTypesQuerySchema> = ({
    query,
  }) => new UrlBuilder(`/api/publishers/contracts/collaboration-types/`).query(query).build();
  export const main: ToolkitEndpointBuilder<void, void> = () => `/api/publishers/`;

  export const getPublisherByDir: ToolkitEndpointBuilder<
    PublisherDirParamsSchema,
    PublisherQuerySchema
  > = ({ params }) => new UrlBuilder(`/api/v2/publishers/${params!.dir}/`).build();

  export const addPromo: ToolkitEndpointBuilder<PublisherAddPromoParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/publishers/${params!.id}/add-promo/`).build();

  export const getPublisherAdTitlesDetails: ToolkitEndpointBuilder<
    PublisherAdTitlesDetailsParamsSchema,
    PublisherAdTitlesDetailsQuerySchema
  > = ({ params }) => new UrlBuilder(`/api/dashboard/promo/${params!.id}/${params!.dir}/`).build();

  export const getPublisherAdTitlesList: ToolkitEndpointBuilder<
    PublisherAdTitlesListParamsSchema,
    PublisherAdTitlesListQuerySchema
  > = ({ params }) =>
    new UrlBuilder(
      `/api/dashboard/promo/list/?${queryString.stringify({ publisher_id: params!.id })}`
    ).build();

  export const activateAdCall: ToolkitEndpointBuilder<PublisherActivateAdParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/dashboard/promo/${params?.publisherId}/${params?.dir}/`).build();
  export const connectedCards: ToolkitEndpointBuilder<PublisherIdParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/publishers/${params?.id!}/cards/`).build();

  export const deactivateAdCall: ToolkitEndpointBuilder<
    PublisherDeactivateAdParamsSchema,
    void
  > = ({ params }) =>
    new UrlBuilder(`/api/dashboard/promo/${params?.publisherId}/${params?.dir}/`).build();

  export const buyDays: ToolkitEndpointBuilder<PublisherBuyAdDaysParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/dashboard/promo/${params?.publisherId}/charge/`).build();

  export const titleSelectOptions: ToolkitEndpointBuilder<
    PublisherTitleSelectOptionsParamsSchema,
    PublisherTitleSelectOptionsQuerySchema
  > = ({ query }) => new UrlBuilder(`/api/dashboard/promo/add/`).query(query).build();

  export const addAdTitleCall: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/dashboard/promo/add/`).build();

  export const memberByPublisherId: ToolkitEndpointBuilder<
    PublisherMembersListParamsSchema,
    void
  > = ({ params }) => new UrlBuilder(`/api/v2/publishers/${params!.publisherId}/members/`).build();

  export const manualWithdraw: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/panel/withdraw/`).build();

  export const getStrikes: ToolkitEndpointBuilder<PublisherGetStrikesParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/v2/publishers/${params!.publisherId}/strikes/`).build();

  export const contractors: ToolkitEndpointBuilder<PublisherContractorParamsSchema, void> = ({
    params,
  }) => new UrlBuilder(`/api/publishers/${params!.publisherId}/contractors/`).build();

  export const addPromoDays: ToolkitEndpointBuilder<void, void> = () =>
    new UrlBuilder(`/api/dashboard/promo/list/`).build();
}
