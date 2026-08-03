import {
  v2TitlesMomentsCatalogList,
  v2TitlesMomentsList,
  v2TitlesMomentsRetrieve,
} from '@re/api/generated/sdk.gen';

import { withClientRequest } from '~shared/api/request-api-with-client';

export const reV2TitlesMomentsCatalogList = withClientRequest(v2TitlesMomentsCatalogList);
export const reV2TitlesMomentsRetrieve = withClientRequest(v2TitlesMomentsRetrieve);
export const reV2TitlesMomentsList = withClientRequest(v2TitlesMomentsList);
