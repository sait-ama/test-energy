import { PublisherEndpoints } from '~entities/publisher/model/endpoints';
import { api } from '~shared/api/$api';
import { apiToolkit, v1Serializer, v2Serializer } from '~shared/api/api-toolkit';
import {
  AllRightsResponseSchema,
  CardListResponseSchema,
  CardRequestSchema,
  PublisherActivateAdParamsSchema,
  PublisherActivateAdRequestSchema,
  PublisherAddAdTitleRequestSchema,
  PublisherAddDaysRequestSchema,
  PublisherAdTitlesDetailsParamsSchema,
  PublisherAdTitlesDetailsQuerySchema,
  PublisherAdTitlesDetailsRequestSchema,
  PublisherAdTitlesDetailsResponseSchema,
  PublisherAdTitlesListParamsSchema,
  PublisherAdTitlesListQuerySchema,
  PublisherAdTitlesListRequestSchema,
  PublisherAdTitlesListResponseSchema,
  PublisherBuyAdDaysParamsSchema,
  PublisherBuyAdDaysRequestSchema,
  PublisherBuyAdDaysResponseSchema,
  PublisherContractorParamsSchema,
  PublisherContractorRequestSchema,
  PublisherDeactivateAdParamsSchema,
  PublisherDeactivateAdRequestSchema,
  PublisherDirParamsSchema,
  PublisherGetStrikesParamsSchema,
  PublisherGetStrikesRequestSchema,
  PublisherIdParamsSchema,
  PublisherMemberDetailParamsSchema,
  PublisherMemberDetailSchema,
  PublisherMembersListParamsSchema,
  PublisherMembersListResponseSchema,
  PublisherQuerySchema,
  PublisherRequestSchema,
  PublisherResponseSchema,
  PublisherStatisticParamsSchema,
  PublisherStatisticQuerySchema,
  PublisherStatisticResponseSchemaSerialized,
  PublisherTitleSelectOptionsParamsSchema,
  PublisherTitleSelectOptionsQuerySchema,
  PublisherTitleSelectOptionsResponseSchema,
  PublisherUpdateRequestSchema,
  PublisherUpdateResponseSchema,
  PublisherWithDrawListResponseSchema,
  UpdatePublisherMemberParamsSchema,
  UpdatePublisherMemberRequestSchema,
} from '~shared/api/models/publisher';
import type {
  CollaborationTypesQuerySchema,
  CollaborationTypesResponseSchema,
  PostPublisherContractRequestSchema,
  PublisherActsByContractIdParamsSchema,
  PublisherActsByContractIdResponseSchema,
  PublisherAddPromoParamsSchema,
  PublisherContractFormSchema,
  PublisherContractParamsSchema,
  PublisherContractQuerySchema,
  PublisherContractSchema,
  PublisherContractSendFileParamsSchema,
  PublisherContractSendFileRequestSchema,
  PublisherManualWithdrawRequestSchema,
} from '~shared/api/models/publisher-contract';
import type { PaginationQuerySchema } from '~shared/types/buisines';

// todo: types!!!
const createPublisherRouter = apiToolkit(({ api, toolbox }) => ({
  publisherStatistic: toolbox.createMethod<
    PublisherStatisticResponseSchemaSerialized,
    void,
    PublisherStatisticParamsSchema,
    PublisherStatisticQuerySchema
  >((vars, opts) => {
    // @ts-ignore
    return api.get(PublisherEndpoints.Statistic.get(vars), opts).then(v2Serializer);
  }),
  collaborationTypes: toolbox.createMethod<
    CollaborationTypesResponseSchema,
    void,
    void,
    CollaborationTypesQuerySchema
  >(({ query }, opts) => api.get(PublisherEndpoints.collaborationTypes({ query }), opts)),
  memberDetail: toolbox.createMethod<
    PublisherMemberDetailSchema,
    void,
    PublisherMemberDetailParamsSchema,
    void
  >(({ params }, opts) => api.get(PublisherEndpoints.Member.detail({ params }), opts)),
  sendFileContract: toolbox.createMethod<
    void,
    PublisherContractSendFileRequestSchema,
    PublisherContractSendFileParamsSchema,
    void
  >(({ params, data }) => api.post(PublisherEndpoints.Contract.postContractFile({ params }), data)),
  rights: toolbox.createMethod<AllRightsResponseSchema, void, void, void>(() =>
    api
      .get<AllRightsResponseSchema['results']>(PublisherEndpoints.rights())
      .then((v) => ({ results: v }))
  ),
  editMember: toolbox.createMethod<
    UpdatePublisherMemberRequestSchema,
    UpdatePublisherMemberRequestSchema,
    UpdatePublisherMemberParamsSchema,
    void
  >(({ params, data }) =>
    api.put(
      PublisherEndpoints.Member.detail({
        params: {
          memberId: params!.user_id,
          id: params!.publisher_id,
        },
      }),
      data
    )
  ),
  createMember: toolbox.createMethod<
    UpdatePublisherMemberRequestSchema,
    UpdatePublisherMemberRequestSchema,
    UpdatePublisherMemberParamsSchema,
    void
  >(({ params, data }) =>
    api.post(
      PublisherEndpoints.Member.detail({
        params: {
          memberId: params!.user_id,
          id: params!.publisher_id,
        },
      }),
      data
    )
  ),

  removeMember: toolbox.createMethod<void, void, UpdatePublisherMemberParamsSchema, void>(
    ({ params }) =>
      api.delete(
        PublisherEndpoints.Member.detail({
          params: {
            memberId: params!.user_id,
            id: params!.publisher_id,
          },
        }),
        undefined
      )
  ),
  getActsByContractId: toolbox.createMethod<
    PublisherActsByContractIdResponseSchema,
    void,
    PublisherActsByContractIdParamsSchema,
    void
  >((variables, opts) => api.get(PublisherEndpoints.Contract.actsByContract(variables), opts)),
  postContract: toolbox.createMethod<
    PublisherContractSchema,
    PostPublisherContractRequestSchema,
    PublisherContractParamsSchema,
    PostPublisherContractRequestSchema
  >(({ params, data }, opts) =>
    api.post(PublisherEndpoints.Contract.postContract({ params }), data, opts)
  ),
  add: toolbox.createMethod((variables, opts) =>
    api.post(PublisherEndpoints.main({}), variables.data, opts)
  ),
  addDays: toolbox.createMethod<void, void, PublisherAddPromoParamsSchema, void>(
    (variables, opts) => api.post(PublisherEndpoints.addPromo(variables), opts)
  ),
  getPublisherByDir: toolbox.createMethod<
    PublisherResponseSchema,
    PublisherRequestSchema,
    PublisherDirParamsSchema,
    PublisherQuerySchema
  >(
    // @ts-ignore
    (variables, opts) =>
      api.get(PublisherEndpoints.getPublisherByDir(variables), opts).then(v1Serializer)
  ),
  getPublisherAdTitlesDetails: toolbox.createMethod<
    PublisherAdTitlesDetailsResponseSchema,
    PublisherAdTitlesDetailsRequestSchema,
    PublisherAdTitlesDetailsParamsSchema,
    PublisherAdTitlesDetailsQuerySchema
  >((variables, opts) => api.get(PublisherEndpoints.getPublisherAdTitlesDetails(variables), opts)),
  getPublisherAdTitlesList: toolbox.createMethod<
    PublisherAdTitlesListResponseSchema,
    PublisherAdTitlesListRequestSchema,
    PublisherAdTitlesListParamsSchema,
    PublisherAdTitlesListQuerySchema
  >((variables, opts) => api.get(PublisherEndpoints.getPublisherAdTitlesList(variables), opts)),
  // activateAdCall: toolbox.createMethod<PublisherActivateAdCallRequestSchema, void, PublisherActivateAdCallParamsSchema, void>((variables, opts) =>
  //     api.post(PublisherEndpoints.activateAdCall(variables), opts),
  // ),

  activateAdCall: toolbox.createMethod<
    PublisherActivateAdRequestSchema,
    void,
    PublisherActivateAdParamsSchema,
    void
  >((variables, opts) =>
    api.post(PublisherEndpoints.activateAdCall(variables), variables.data, opts)
  ),

  deactivateAdCall: toolbox.createMethod<
    void,
    PublisherDeactivateAdRequestSchema,
    PublisherDeactivateAdParamsSchema,
    void
  >((variables, opts) =>
    api.put(PublisherEndpoints.deactivateAdCall(variables), variables.data, opts)
  ),

  addAdTitleCall: toolbox.createMethod<void, PublisherAddAdTitleRequestSchema, void, void>(
    (variables, opts) =>
      api.post(PublisherEndpoints.addAdTitleCall(variables), variables.data, opts)
  ),
  changeByDir: toolbox.createMethod<
    PublisherUpdateResponseSchema,
    PublisherUpdateRequestSchema,
    PublisherDirParamsSchema,
    void
  >((variables, opts) => api.put(PublisherEndpoints.ByDir.change(variables), variables.data, opts)),

  titleSelectOptions: toolbox.createMethod<
    PublisherTitleSelectOptionsResponseSchema,
    void,
    PublisherTitleSelectOptionsParamsSchema,
    PublisherTitleSelectOptionsQuerySchema
  >((variables, opts) => api.get(PublisherEndpoints.titleSelectOptions(variables), opts)),

  memberByPublisherId: toolbox.createMethod<
    PublisherMembersListResponseSchema,
    void,
    PublisherMembersListParamsSchema,
    void
  >((variables, opts) =>
    // @ts-ignore
    api.get(PublisherEndpoints.memberByPublisherId(variables), opts).then((v) => ({ results: v }))
  ),
  getContractFields: toolbox.createMethod<
    PublisherContractFormSchema,
    void,
    PublisherContractParamsSchema,
    PublisherContractQuerySchema
  >((variables, fetchOptions) =>
    api.get(PublisherEndpoints.Contract.getContractFields(variables), fetchOptions)
  ),

  manualWithdraw: toolbox.createMethod<void, PublisherManualWithdrawRequestSchema, void, void>(
    (variables, fetchOptions) =>
      api.post(PublisherEndpoints.manualWithdraw(variables), variables.data, fetchOptions)
  ),
  getStrikes: toolbox.createMethod<
    PublisherGetStrikesRequestSchema,
    void,
    PublisherGetStrikesParamsSchema,
    void
  >((variables, opts) => api.get(PublisherEndpoints.getStrikes(variables), opts)),
  createContractor: toolbox.createMethod<
    void,
    PublisherContractorRequestSchema,
    PublisherContractorParamsSchema,
    void
  >((variables, opts) => api.post(PublisherEndpoints.contractors(variables), variables.data, opts)),
  getConnectedCards: toolbox.createMethod<
    CardListResponseSchema,
    void,
    PublisherIdParamsSchema,
    void
  >((variables, opts) => api.get(PublisherEndpoints.connectedCards(variables), opts)),
  removeCard: toolbox.createMethod<void, CardRequestSchema, PublisherIdParamsSchema, void>(
    (variables, opts) =>
      api.delete(PublisherEndpoints.connectedCards(variables), variables.data, opts)
  ),
  connectCard: toolbox.createMethod<V1Response<any, never>, any, PublisherIdParamsSchema, void>(
    (variables, opts) => api.post(PublisherEndpoints.connectedCards(variables), {}, opts)
  ),
  cancelWithdraw: toolbox.createMethod<void, any, PublisherIdParamsSchema, void>(
    (variables, opts) => api.delete(PublisherEndpoints.WithDraw.base(variables), {}, opts)
  ),
  withdrawList: toolbox.createMethod<
    PublisherWithDrawListResponseSchema,
    any,
    PublisherIdParamsSchema,
    PaginationQuerySchema
  >((variables, opts) =>
    // @ts-ignore
    api.get(PublisherEndpoints.WithDraw.list(variables), opts)
  ),
  exit: toolbox.createMethod<void, any, PublisherIdParamsSchema, void>((variables, opts) =>
    api.put(PublisherEndpoints.ByDir.exit(variables), opts)
  ),
  addPromoDays: toolbox.createMethod<void, PublisherAddDaysRequestSchema, void, void>(
    (variables, opts) => api.put(PublisherEndpoints.addPromoDays(variables), variables.data, opts)
  ),
  buyDays: toolbox.createMethod<
    PublisherBuyAdDaysResponseSchema,
    PublisherBuyAdDaysRequestSchema,
    PublisherBuyAdDaysParamsSchema,
    void
  >((variables, opts) => api.post(PublisherEndpoints.buyDays(variables), variables.data, opts)),
}));
export namespace PublisherRepository {
  const router = createPublisherRouter({
    api,
  });
  export namespace Statistic {
    export const get = router.publisherStatistic;
  }
  export const {
    changeByDir,
    exit,
    cancelWithdraw,
    connectCard,
    removeCard,
    withdrawList,
    getConnectedCards,
    add,
    createMember,
    editMember,
    removeMember,
    getActsByContractId,
    rights,
    sendFileContract,
    collaborationTypes,
    memberByPublisherId,
    postContract,
    getContractFields,
    addDays,
    getPublisherByDir,
    getPublisherAdTitlesDetails,
    getPublisherAdTitlesList,
    activateAdCall,
    deactivateAdCall,
    manualWithdraw,
    titleSelectOptions,
    addAdTitleCall,
    memberDetail,
    getStrikes,
    createContractor,
    addPromoDays,
    buyDays,
  } = router;
}
