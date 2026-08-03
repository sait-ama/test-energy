import { useMemo } from 'react';

import { AnalyticsRepository } from '~entities/analytics/model/repository';
import { requestsCollector } from '~shared/utils/request-collect';

export const useCollectRequests = () => {
  const handleView = async (views: number[]) => {
    await AnalyticsRepository.savePromoAction({ data: { operation: 'render', target: views } });
  };

  return useMemo(() => requestsCollector(handleView), []);
};
