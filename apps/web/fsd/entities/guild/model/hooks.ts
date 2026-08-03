'use client';
import { useCallback } from 'react';
import { useParams } from 'next/navigation';

import {
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';

import { ClubDetail } from '@re/api/generated/types.gen';

import { useSession } from '~shared/lib/session/use-session';

import { getClubsRetrieveQueryOptions } from '../api/queries';
import { getGuildRoleBySession } from './utils';

export const useDirDepClub = () => {
  const { dir: paramsDir } = useParams<{ dir: string }>();

  return paramsDir;
};

export const useGuildQuery = (
  overrides?: Omit<UseQueryOptions<ClubDetail>, 'queryKey' | 'queryFn'>
) => {
  const dir = useDirDepClub();

  const options = {
    ...getClubsRetrieveQueryOptions({ path: { dir } }),
    ...overrides,
  };

  return useQuery(options);
};

export const useGuildSuspenseQuery = (
  overrides?: Omit<UseSuspenseQueryOptions<ClubDetail>, 'queryKey' | 'queryFn'>
) => {
  const dir = useDirDepClub();

  const options = {
    ...getClubsRetrieveQueryOptions({ path: { dir } }),
    ...overrides,
  };

  return useSuspenseQuery(options);
};

export const useGuildMemberRole = () => {
  const sessionId = useSession((v) => v?.id);
  const dir = useDirDepClub();

  const roleSelector = useCallback(
    (club: ClubDetail) => {
      return getGuildRoleBySession({ club, sessionId });
    },
    [sessionId]
  );

  const { data: role } = useQuery({
    ...getClubsRetrieveQueryOptions({ path: { dir } }),
    select: roleSelector,
  });

  return role;
};
