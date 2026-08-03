import { useQuery } from '@tanstack/react-query';

import { preloadImage } from '~shared/utils/is-image-loaded';

import { HALLOWEEN_GIFT_IMAGES } from './const';

export const useHalloweenGiftImage = (position?: string | null) => {
  const src = position ? HALLOWEEN_GIFT_IMAGES[position] : null;

  const { data } = useQuery({
    queryKey: ['useHalloweenGiftImage', src],
    queryFn: () => preloadImage(src),
    enabled: !!src,
  });

  return {
    src: data ? src : null,
  };
};
