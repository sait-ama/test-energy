'use server';

import { cookies } from 'next/headers';

export const getToken = async () => {
  return await cookies().then((m) => m.get('token')?.value);
};

export const getPreference = async () => {
  return await cookies().then((m) => m.get('preference')?.value);
};
