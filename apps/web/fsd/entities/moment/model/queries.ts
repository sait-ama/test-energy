import {
  v2TitlesMomentsCatalogListInfiniteOptions,
  v2TitlesMomentsListInfiniteOptions,
  v2TitlesMomentsRetrieveOptions,
} from '@re/api/generated/@tanstack/react-query.gen';

import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';

export const reV2TitlesMomentsRetrieveOptions = createQueryInfiniteGeneratedWithClient(
  v2TitlesMomentsRetrieveOptions
);

export const reV2TitlesMomentsCatalogListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2TitlesMomentsCatalogListInfiniteOptions
);
export const reV2TitlesMomentsListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
  v2TitlesMomentsListInfiniteOptions
);
