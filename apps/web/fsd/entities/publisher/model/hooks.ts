'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import type { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { PublisherProfileAbilityBuilder } from '~entities/publisher/model/ability/rights';
import { PublisherSettingsAbilityBuilder } from '~entities/publisher/model/ability/settings';
import { getPublisherQuery, usePublisherQuery } from '~entities/publisher/model/queries';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import type {
  PublisherMemberDetailSchema,
  PublisherResponseSchema,
} from '~shared/api/models/publisher';
import { getQueryClient } from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';

export const usePublisher = <T = PublisherResponseSchema>(
  dir: string,
  select?: (publisher: PublisherResponseSchema) => T
) => {
  // @ts-ignore
  return usePublisherQuery({ variables: { params: { dir } } }, { select }) as UseQueryResult<T>;
};
export const useCurrentPublisher = <T = PublisherResponseSchema>(
  select?: (publisher: PublisherResponseSchema) => T
) => {
  const { dir } = useParams<{ dir: string }>();

  return usePublisher(dir, select);
};
export const usePublisherSettingsAbility = () => {
  const { data: publisher } = useCurrentPublisher();
  const session = useSession();
  const ability = new PublisherSettingsAbilityBuilder({ publisher, session });
  return useMemo(() => {
    ability.session = session;
    ability.publisher = publisher!;
    return ability.build();
  }, [session?.id, publisher]);
};
export const usePublisherProfileAbility = () => {
  const queryClient = getQueryClient();

  const { data: publisher } = useCurrentPublisher();
  const session = useSession();

  const dep = publisher?.props;
  const s = useSiteConfig();
  const ability = new PublisherProfileAbilityBuilder({
    publisherDep: dep,
    session,
    feats: s?.features,
  });
  return useMemo(() => {
    ability.session = session;
    ability.publisherDep = dep!;
    ability.feats = s?.features;
    const member = publisher?.props.is_member
      ? queryClient.getQueryData<PublisherMemberDetailSchema>(
          PublisherQueryKey.MemberDetail.get({
            params: { id: publisher.content.id, memberId: session?.id! },
          })
        )
      : undefined;
    if (member) {
      ability.sessionAsMember = member;
    }
    return ability.build();
  }, [session?.id, publisher]);
};
export const useSuspensePublisher = <T = PublisherResponseSchema>(
  dir: string,
  select?: (publisher: PublisherResponseSchema) => T
) =>
  // @ts-ignore
  useSuspenseQuery<PublisherResponseSchema>({
    ...getPublisherQuery({ variables: { params: { dir } } }),
    select,
  }) as UseSuspenseQueryResult<T>;
export const useCurrentSuspensePublisherQuery = <T = PublisherResponseSchema>(
  select?: (publisher: PublisherResponseSchema) => T
) => {
  const { dir } = useParams<{ dir: string }>();
  return useSuspensePublisher(dir, select);
};
