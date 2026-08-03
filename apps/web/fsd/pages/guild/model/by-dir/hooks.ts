import { useMemo } from 'react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useGuildMemberRole } from '~entities/guild/model/hooks';

import { GuildByDirProfileAbilities, GuildByDirRequestsAbilities } from './abilities';
import { segments, segmentsRequests } from './consts';

export const useAvailableSegments = () => {
  const role = useGuildMemberRole();
  const features = useSiteConfig((v) => v?.features);

  return useMemo(
    () =>
      segments.filter((segment) => {
        return GuildByDirProfileAbilities[segment]({ role, features });
      }),
    [role, features]
  );
};

export const useAvailableSegmentsRequests = () => {
  const role = useGuildMemberRole();

  return useMemo(
    () =>
      segmentsRequests.filter((segment) => {
        return GuildByDirRequestsAbilities[segment]({ role });
      }),
    [role]
  );
};
