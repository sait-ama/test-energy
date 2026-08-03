import { useMemo } from 'react';

import { usePublisherPrivileges } from '~entities/publisher/model/queries';
import type { Privilege } from '~shared/api/models/publisher';

export const usePublisherPrivilegesRecord = (): {
  record: Record<number, string>;
  array: Privilege[];
} => {
  const privileges = usePublisherPrivileges();

  return useMemo(
    () => ({
      record: privileges.reduce((acc, curr) => {
        if (!privileges) return {};
        acc[curr.id] = curr.name;
        return acc;
      }, {}),
      array: privileges,
    }),
    [privileges && (privileges.length ?? 0) >= 1]
  );
};
