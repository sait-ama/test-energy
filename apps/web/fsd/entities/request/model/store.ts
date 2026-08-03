import { createContextSelector } from '@re/core/utils/create-context-selector';

import type { ChangeRequestSchema } from '~shared/api/models/panel';

export const { Provider: RequestItemProvider, useStore: useRequestItem } = createContextSelector<
  ChangeRequestSchema,
  ChangeRequestSchema
>((v) => v);
