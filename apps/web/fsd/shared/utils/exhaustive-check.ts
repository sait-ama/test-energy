import { publicEnv } from '~shared/utils/env';

export function exhaustiveCheck(_param: never) {
  if (publicEnv('NODE_ENV') === 'development') {
    throw new Error('exhaustive check');
  }
}
