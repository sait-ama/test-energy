import { createQueryGenerated, createQueryInfiniteGenerated } from '@re/api/exports-core';

import { client } from '~shared/api/client';

export const createQueryGeneratedWithClient = createQueryGenerated({ client });
export const createQueryInfiniteGeneratedWithClient = createQueryInfiniteGenerated({ client });
