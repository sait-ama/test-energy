'use client';

import { ReactNode, Suspense, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Portal } from '@re/ui-kit/ui/portal';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';

import { v2UsersCurrentRetrieveQueryKey } from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { isHalloweenDate } from '~shared/lib/event-management/is-halloween';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { generateHash } from '~shared/lib/halloween-event/hash';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { HALLOWEEN_GIFT_IMAGES, HalloweenGiftPosition } from '../model/const';
import { useHalloweenGiftImage } from '../model/hooks';
import { HalloweenEventRepository } from '../model/repository';
import { HalloweenGiftStoreProvider, useHalloweenGiftStore } from '../model/store';

import { HalloweenGiftSubscriber } from './halloween-gift-subscriber';

interface HalloweenImageProps {
  onClick: () => void;
}

const ImageLeft = (props: HalloweenImageProps) => (
  <motion.div
    className="pointer-events-auto absolute top-1/2 left-0 h-auto -translate-y-1/2"
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1, transition: { duration: 0.6 } }}
    exit={{ x: -100, opacity: 0, transition: { duration: 0.4 } }}
  >
    <Image
      src={HALLOWEEN_GIFT_IMAGES[HalloweenGiftPosition.LEFT]}
      className="cursor-pointer transition-all duration-300 select-none hover:scale-110 hover:opacity-80"
      alt="halloween-gift-l"
      draggable={false}
      width={193}
      height={192}
      {...props}
    />
  </motion.div>
);

const ImageLeftBottom = (props: HalloweenImageProps) => (
  <motion.div
    className="pointer-events-auto absolute bottom-0 left-0 h-auto"
    initial={{ x: -100, y: 100, opacity: 0 }}
    animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 0.6 } }}
    exit={{ x: -100, y: 100, opacity: 0, transition: { duration: 0.4 } }}
  >
    <Image
      src={HALLOWEEN_GIFT_IMAGES[HalloweenGiftPosition.LEFT_BOTTOM]}
      className="cursor-pointer transition-all duration-300 select-none hover:scale-110 hover:opacity-80"
      alt="halloween-gift-lb"
      draggable={false}
      width={210}
      height={200}
      {...props}
    />
  </motion.div>
);

const ImageRightBottom = (props: HalloweenImageProps) => (
  <motion.div
    className="pointer-events-auto absolute right-0 bottom-0 h-auto"
    initial={{ x: 100, y: 100, opacity: 0 }}
    animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 0.6 } }}
    exit={{ x: 100, y: 100, opacity: 0, transition: { duration: 0.4 } }}
  >
    <Image
      src={HALLOWEEN_GIFT_IMAGES[HalloweenGiftPosition.RIGHT_BOTTOM]}
      className="cursor-pointer transition-all duration-300 select-none hover:scale-110 hover:opacity-80"
      alt="halloween-rb"
      draggable={false}
      width={106}
      height={108}
      {...props}
    />
  </motion.div>
);

const HalloweenGiftsContainerContent = () => {
  const t = useTranslations('halloween-gifts');
  const session = useSession();
  const { giftPosition, removeGift } = useHalloweenGiftStore();

  const { mutateAsync: handleCollectGift, isPending } = useMutation({
    mutationFn: async (signature: string) => await HalloweenEventRepository.collectGift(signature),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
      });
    },
  });

  const imageLoaded = !!useHalloweenGiftImage(giftPosition || 'lb');

  const handleClick = async () => {
    const toast = await importToastAsync();
    const eventPoints = session?.event_points || 0;
    const signature = await generateHash(eventPoints);

    try {
      await handleCollectGift(signature);
      removeGift();

      toast.success(t('collect-message'));
    } catch (e) {
      await resolveErrorAsync(e);
    }
  };

  const ImageComponent = useMemo(() => {
    if (!giftPosition) return null;

    if (giftPosition === HalloweenGiftPosition.LEFT) return ImageLeft;
    if (giftPosition === HalloweenGiftPosition.LEFT_BOTTOM) return ImageLeftBottom;
    if (giftPosition === HalloweenGiftPosition.RIGHT_BOTTOM) return ImageRightBottom;

    return null;
  }, [giftPosition]);

  if (isPending) return null;

  return (
    <AnimatePresence>
      {giftPosition && imageLoaded && ImageComponent ? (
        <Portal.Root>
          <div className="pointer-events-none fixed top-(--header-height) right-0 bottom-(--bottom-bar-height) left-0 z-1000 overflow-hidden md:bottom-0">
            <div className="relative h-full w-full">
              <ImageComponent onClick={handleClick} />
            </div>
          </div>
        </Portal.Root>
      ) : null}
    </AnimatePresence>
  );
};

interface HalloweenGiftsContainerBoundaryProps {
  children: ReactNode;
}
const HalloweenGiftsContainerBoundary = ({ children }: HalloweenGiftsContainerBoundaryProps) => {
  const session = useSession();

  if (!session) return null;
  if (!isHalloweenDate()) return null;
  if (
    session.event_points_today == null ||
    session.event_points_day_max == null ||
    session.event_points_today >= session.event_points_day_max
  )
    return null;

  return children;
};

export const HalloweenGiftsContainer = () => (
  <HalloweenGiftsContainerBoundary>
    <HalloweenGiftStoreProvider>
      <Suspense fallback={null}>
        <HalloweenGiftsContainerContent />
      </Suspense>
      <HalloweenGiftSubscriber />
    </HalloweenGiftStoreProvider>
  </HalloweenGiftsContainerBoundary>
);
