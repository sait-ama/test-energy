import {
  formsPublishersRetrieveOptions,
  publishersCardsRetrieveOptions,
  publishersContractFilesRetrieveOptions,
  publishersContractorsRetrieveOptions,
  publishersContractRetrieveOptions,
  publishersContractsActsDownloadRetrieveOptions,
  publishersContractsActsRetrieveOptions,
  publishersDonatesRetrieveInfiniteOptions,
  publishersDonatesRetrieveOptions,
  publishersRetrieve2Options,
  publishersRetrieveOptions,
  publishersStatisticsCsvRetrieveOptions,
  publishersStatisticsRetrieveOptions,
  publishersWithdrawRetrieveInfiniteOptions,
  publishersWithdrawRetrieveOptions,
  v2PublishersAchievementsListInfiniteOptions,
  v2PublishersAchievementsListOptions,
  v2PublishersCommentsListInfiniteOptions,
  v2PublishersCommentsListOptions,
  v2PublishersInvitationsRetrieveInfiniteOptions,
  v2PublishersInvitationsRetrieveOptions,
  v2PublishersMembersListOptions,
  v2PublishersMembersRetrieveOptions,
  v2PublishersRetrieve2Options,
  v2PublishersRetrieveOptions,
  v2PublishersRightsRetrieveOptions,
  v2PublishersStrikesListInfiniteOptions,
  v2PublishersStrikesListOptions,
  v2PublishersStrikesRetrieveOptions,
} from '@re/api/generated/@tanstack/react-query.gen';

import {
  createQueryGeneratedWithClient,
  createQueryInfiniteGeneratedWithClient,
} from '~shared/api/queries-code-gen-with-client';

// Non-infinite options
export const reFormsPublishersRetrieveOptions = createQueryGeneratedWithClient(
  formsPublishersRetrieveOptions
);
export const rePublishersRetrieveOptions =
  createQueryGeneratedWithClient(publishersRetrieveOptions);
export const rePublishersRetrieveByDirOptions = createQueryGeneratedWithClient(
  publishersRetrieve2Options
);
export const rePublishersStatisticsRetrieveOptions = createQueryGeneratedWithClient(
  publishersStatisticsRetrieveOptions
);
export const rePublishersStatisticsCsvRetrieveOptions = createQueryGeneratedWithClient(
  publishersStatisticsCsvRetrieveOptions
);
export const rePublishersCardsRetrieveOptions = createQueryGeneratedWithClient(
  publishersCardsRetrieveOptions
);
export const rePublishersContractRetrieveOptions = createQueryGeneratedWithClient(
  publishersContractRetrieveOptions
);
export const rePublishersContractFilesRetrieveOptions = createQueryGeneratedWithClient(
  publishersContractFilesRetrieveOptions
);
export const rePublishersContractorsRetrieveOptions = createQueryGeneratedWithClient(
  publishersContractorsRetrieveOptions
);
export const rePublishersDonatesRetrieveOptions = createQueryGeneratedWithClient(
  publishersDonatesRetrieveOptions
);
export const rePublishersWithdrawRetrieveOptions = createQueryGeneratedWithClient(
  publishersWithdrawRetrieveOptions
);
export const rePublishersContractsActsRetrieveOptions = createQueryGeneratedWithClient(
  publishersContractsActsRetrieveOptions
);
export const rePublishersContractsActsDownloadRetrieveOptions = createQueryGeneratedWithClient(
  publishersContractsActsDownloadRetrieveOptions
);

export const reV2PublishersRetrieveOptions = createQueryGeneratedWithClient(
  v2PublishersRetrieveOptions
);
export const reV2PublishersRetrieveByDirOptions = createQueryGeneratedWithClient(
  v2PublishersRetrieve2Options
);
export const reV2PublishersAchievementsListOptions = createQueryGeneratedWithClient(
  v2PublishersAchievementsListOptions
);
export const reV2PublishersCommentsListOptions = createQueryGeneratedWithClient(
  v2PublishersCommentsListOptions
);
export const reV2PublishersMembersListOptions = createQueryGeneratedWithClient(
  v2PublishersMembersListOptions
);
export const reV2PublishersMembersRetrieveOptions = createQueryGeneratedWithClient(
  v2PublishersMembersRetrieveOptions
);
export const reV2PublishersStrikesListOptions = createQueryGeneratedWithClient(
  v2PublishersStrikesListOptions
);
export const reV2PublishersStrikesRetrieveOptions = createQueryGeneratedWithClient(
  v2PublishersStrikesRetrieveOptions
);
export const reV2PublishersInvitationsRetrieveOptions = createQueryGeneratedWithClient(
  v2PublishersInvitationsRetrieveOptions
);
export const reV2PublishersRightsRetrieveOptions = createQueryGeneratedWithClient(
  v2PublishersRightsRetrieveOptions
);

// Infinite options
export const rePublishersDonatesRetrieveInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  publishersDonatesRetrieveInfiniteOptions
);
export const rePublishersWithdrawRetrieveInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  publishersWithdrawRetrieveInfiniteOptions
);
export const reV2PublishersAchievementsListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2PublishersAchievementsListInfiniteOptions
);
export const reV2PublishersCommentsListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2PublishersCommentsListInfiniteOptions
);
export const reV2PublishersStrikesListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2PublishersStrikesListInfiniteOptions
);
export const reV2PublishersInvitationsRetrieveInfiniteOptions =
  createQueryInfiniteGeneratedWithClient(v2PublishersInvitationsRetrieveInfiniteOptions);
