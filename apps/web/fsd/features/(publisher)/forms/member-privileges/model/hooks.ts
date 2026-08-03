import { useMemo } from 'react';

import { useRightsQuery } from '~entities/publisher/model/queries';
import type { RightSchema } from '~shared/api/models/publisher';

export const useAllRightsRecord = (): { record: Record<string, string>; array: RightSchema[] } => {
  const { data: { results: allRights = [] } = {} } = useRightsQuery();
  return useMemo(
    () => ({
      record: !allRights
        ? {}
        : allRights.reduce((acc, currentValue) => {
            acc[currentValue.name] = currentValue.label;
            return acc;
          }, {}),
      array: allRights,
    }),
    [allRights]
  );
};
