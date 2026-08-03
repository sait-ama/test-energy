'use client';

import { use, useMemo } from 'react';

import { sendGAEvent, sendGTMEvent } from '@next/third-parties/google';
import { v2UsersCurrentRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { v2UsersCurrentRetrieve } from '@re/api/generated/sdk.gen';
import { CurrentUser } from '@re/api/generated/types.gen';
import { createContext } from '@re/core/utils/create-context';
import { setUser } from '@sentry/nextjs';
import { QueryFunction, skipToken, useQuery } from '@tanstack/react-query';

import { AuthCookiesService, AuthService } from '~entities/user/model/lib';
import { client } from '~shared/api/client';
import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useSaveAuthProvider } from '~shared/lib/metrics/shared';
import { isApiError } from '~shared/types/api.type-guard';
import { isEmpty } from '~shared/utils/is-empty';

export const { useStore: useSession, Provider: SessionProvider } = createContext<
  DetailedCurrentUserSchema | undefined,
  Promise<DetailedCurrentUserSchema | null>
>((promise) => {
  const initialUser = use(promise);

  useSaveAuthProvider(sendGAEvent);

  const hasServerSideCookie = !isEmpty(initialUser);

  const options = v2UsersCurrentRetrieveOptions({ client });

  const queryFn: QueryFunction<CurrentUser> = async ({ queryKey, signal }) => {
    try {
      const user = await v2UsersCurrentRetrieve<true>({
        ...options,
        ...queryKey[0],
        signal,
        throwOnError: true,
        client,
      }).then((v) => v.data);

      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        ip_address: '{{auto}}',
      });

      sendGTMEvent({ user_id: user.id });

      AuthCookiesService.setClientUser(user);

      return user!;
    } catch (e: unknown) {
      if (isApiError(e)) {
        if (e.data.statusCode === 401) {
          // TODO: maybe it's no necessary to reload page after logout
          // user was already logged in, but token is expired now
          // it will be great to open auth modal
          await AuthService.logout({ refreshAfter: false });
        } else {
          await resolveErrorAsync(e);
        }
      }
      throw e;
    }
  };

  const { data } = useQuery<CurrentUser>({
    queryKey: options.queryKey,
    throwOnError: false,
    refetchOnMount: hasServerSideCookie ? 'always' : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: initialUser ?? undefined,
    retry: false,
    queryFn: hasServerSideCookie ? queryFn : skipToken,
  });

  return useMemo(() => data || undefined, [data]);
}, 'SessionStore');
