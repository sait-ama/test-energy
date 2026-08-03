import React from 'react';

import { RateTitle } from '~features/rate-title/ui/rate-title';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { useLogged } from '~shared/lib/session/use-logged';

export const RateTitleSection = () => {
  const logged = useLogged();
  const { data } = useCurrentPageSuspenseTitleDetail();
  const { rated, continue_reading } = data ?? {};
  const { index = 0 } = continue_reading ?? {};

  if (!logged) return null;

  if (index <= 5 || rated) return null;

  return <RateTitle />;
};
