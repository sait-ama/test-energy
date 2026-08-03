import { cache } from 'react';
import { cookies } from 'next/headers';

import 'server-only';

export const getAgeSubmitted = cache(async () => {
  const cookieValue = (await cookies()).get('agesubmitted')?.value;

  return cookieValue === 'true';
});
