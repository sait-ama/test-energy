import {
  formsPublishersRetrieve,
  panelWithdrawCreate,
  publishersCardsCreate,
  publishersCardsDestroy,
  publishersCardsRetrieve,
  publishersContractCreate,
  publishersContractFilesCreate,
  publishersContractFilesRetrieve,
  publishersContractorsCreate,
  publishersContractorsRetrieve,
  publishersContractRetrieve,
  publishersContractsActsDownloadRetrieve,
  publishersContractsActsRetrieve,
  publishersContractVerifyCreate,
  publishersCreate,
  publishersDonatesRetrieve,
  publishersRetrieve,
  publishersRetrieve2,
  publishersStatisticsCsvRetrieve,
  publishersStatisticsRetrieve,
  publishersUpdate,
  publishersUpdate2,
  publishersWithdrawRetrieve,
  v2PublishersAchievementsList,
  v2PublishersAddPromoCreate,
  v2PublishersCommentsList,
  v2PublishersCreate,
  v2PublishersCreate2,
  v2PublishersInvitationsCreate,
  v2PublishersInvitationsDestroy,
  v2PublishersInvitationsRetrieve,
  v2PublishersInvitationsUpdate,
  v2PublishersMembersAcceptCreate,
  v2PublishersMembersCreate,
  v2PublishersMembersDestroy,
  v2PublishersMembersExitPartialUpdate,
  v2PublishersMembersExitUpdate,
  v2PublishersMembersList,
  v2PublishersMembersPartialUpdate,
  v2PublishersMembersRetrieve,
  v2PublishersMembersUpdate,
  v2PublishersRetrieve,
  v2PublishersRetrieve2,
  v2PublishersRightsRetrieve,
  v2PublishersStrikesList,
  v2PublishersStrikesRetrieve,
  v2PublishersUpdate,
  v2PublishersUpdate2,
  v2TitlesMomentsList,
  v2TitlesPublisherRetrieve,
} from '@re/api/generated/sdk.gen';

import { withClientRequest } from '~shared/api/request-api-with-client';

export const reV2TitlesMomentsList = withClientRequest(v2TitlesMomentsList);

// Short example for Publishers endpoints wrapped with the decorator
export const rePublishersRetrieve = withClientRequest(publishersRetrieve);
export const rePublishersCreate = withClientRequest(publishersCreate);
export const rePublishersUpdate = withClientRequest(publishersUpdate);
export const rePublishersRetrieveByDir = withClientRequest(publishersRetrieve2);

// Extended list (SDK -> wrapped exports)
export const rePublishersUpdateByDir = withClientRequest(publishersUpdate2);
export const rePublishersStatisticsRetrieve = withClientRequest(publishersStatisticsRetrieve);
export const rePublishersStatisticsCsvRetrieve = withClientRequest(publishersStatisticsCsvRetrieve);
export const rePublishersCardsRetrieve = withClientRequest(publishersCardsRetrieve);
export const rePublishersCardsCreate = withClientRequest(publishersCardsCreate);
export const rePublishersCardsDestroy = withClientRequest(publishersCardsDestroy);
export const rePublishersContractRetrieve = withClientRequest(publishersContractRetrieve);
export const rePublishersContractCreate = withClientRequest(publishersContractCreate);
export const rePublishersContractFilesRetrieve = withClientRequest(publishersContractFilesRetrieve);
export const rePublishersContractFilesCreate = withClientRequest(publishersContractFilesCreate);
export const rePublishersContractorsRetrieve = withClientRequest(publishersContractorsRetrieve);
export const rePublishersContractorsCreate = withClientRequest(publishersContractorsCreate);
export const rePublishersDonatesRetrieve = withClientRequest(publishersDonatesRetrieve);
export const rePublishersWithdrawRetrieve = withClientRequest(publishersWithdrawRetrieve);
export const rePublishersContractVerifyCreate = withClientRequest(publishersContractVerifyCreate);
export const rePublishersContractsActsRetrieve = withClientRequest(publishersContractsActsRetrieve);
export const rePublishersContractsActsDownloadRetrieve = withClientRequest(
  publishersContractsActsDownloadRetrieve
);

// v2-prefixed Publishers
export const reV2PublishersRetrieve = withClientRequest(v2PublishersRetrieve);
export const reV2PublishersCreate = withClientRequest(v2PublishersCreate);
export const reV2PublishersUpdate = withClientRequest(v2PublishersUpdate);
export const reV2PublishersRetrieveByDir = withClientRequest(v2PublishersRetrieve2);
export const reV2PublishersCreateByDir = withClientRequest(v2PublishersCreate2);
export const reV2PublishersUpdateByDir = withClientRequest(v2PublishersUpdate2);
export const reV2PublishersAchievementsList = withClientRequest(v2PublishersAchievementsList);
export const reV2PublishersAddPromoCreate = withClientRequest(v2PublishersAddPromoCreate);
export const reV2PublishersCommentsList = withClientRequest(v2PublishersCommentsList);
export const reV2PublishersMembersList = withClientRequest(v2PublishersMembersList);
export const reV2PublishersMembersDestroy = withClientRequest(v2PublishersMembersDestroy);
export const reV2PublishersMembersRetrieve = withClientRequest(v2PublishersMembersRetrieve);
export const reV2PublishersMembersPartialUpdate = withClientRequest(
  v2PublishersMembersPartialUpdate
);
export const reV2PublishersMembersCreate = withClientRequest(v2PublishersMembersCreate);
export const reV2PublishersMembersUpdate = withClientRequest(v2PublishersMembersUpdate);
export const reV2PublishersMembersAcceptCreate = withClientRequest(v2PublishersMembersAcceptCreate);
export const reV2PublishersMembersExitPartialUpdate = withClientRequest(
  v2PublishersMembersExitPartialUpdate
);
export const reV2PublishersMembersExitUpdate = withClientRequest(v2PublishersMembersExitUpdate);
export const reV2PublishersStrikesList = withClientRequest(v2PublishersStrikesList);
export const reV2PublishersStrikesRetrieve = withClientRequest(v2PublishersStrikesRetrieve);
export const reV2PublishersInvitationsRetrieve = withClientRequest(v2PublishersInvitationsRetrieve);
export const reV2PublishersInvitationsCreate = withClientRequest(v2PublishersInvitationsCreate);
export const reV2PublishersInvitationsDestroy = withClientRequest(v2PublishersInvitationsDestroy);
export const reV2PublishersInvitationsUpdate = withClientRequest(v2PublishersInvitationsUpdate);
export const reV2PublishersRightsRetrieve = withClientRequest(v2PublishersRightsRetrieve);
export const reV2TitlesPublisherRetrieve = withClientRequest(v2TitlesPublisherRetrieve);
export const reFormsPublishersRetrieve = withClientRequest(formsPublishersRetrieve);
export const rePanelWithdrawCreate = withClientRequest(panelWithdrawCreate);
