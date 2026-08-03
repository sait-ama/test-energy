import { createApiDataDecorator } from '@re/api/generators';

import { client } from '~shared/api/client';

export const withClientRequest = createApiDataDecorator({ client });
