'use server';

import { cookies } from 'next/headers';

import dayjs from 'dayjs';

import { publicEnv } from '~shared/utils/env';

export const setCookies = async ({ token, user }) => {
  const store = await cookies();

  store.set({
    name: 'serverToken',
    value: token,
    path: `.${publicEnv('DOMAIN')}`,
    expires: dayjs().add(1, 'year').toDate(),
    sameSite: 'none',
    secure: true,
    httpOnly: true,
  });

  store.set({
    name: 'serverUser',
    value: JSON.stringify(user),
    expires: dayjs().add(1, 'year').toDate(),
    path: `.${publicEnv('DOMAIN')}`,
    sameSite: 'none',
    secure: true,
    httpOnly: true,
  });
};
