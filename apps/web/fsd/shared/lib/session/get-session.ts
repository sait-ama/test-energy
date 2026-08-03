import { cache } from 'react';
import { cookies } from 'next/headers';

import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { isJson } from '~shared/utils/is-json';

import 'server-only';

export const getSession = cache(async () => {
  const cookieValue = (await cookies()).get('user')?.value;

  if (!cookieValue) return null;

  if (!isJson(cookieValue)) return null;

  return JSON.parse(cookieValue) as DetailedCurrentUserSchema;
});
