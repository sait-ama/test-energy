'use server';

import { headers } from 'next/headers';

export const fetchClientHeaders = async () => {
  return await headers();
};
