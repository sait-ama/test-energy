import type { PropsWithChildren } from 'react';

import { publicEnv } from '~shared/utils/env';

export const ProdOnly = (props: PropsWithChildren) => {
  if (publicEnv('NODE_ENV') !== 'production') return null;

  return props.children;
};
