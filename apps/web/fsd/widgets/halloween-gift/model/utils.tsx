import { randInt } from '~shared/utils/rand-int';

import { HalloweenGiftPosition } from './const';

export const generateGiftPosition = () => {
  const positions = Object.values(HalloweenGiftPosition);
  const randomIndex = randInt(0, positions.length);

  return positions[randomIndex]!;
};
