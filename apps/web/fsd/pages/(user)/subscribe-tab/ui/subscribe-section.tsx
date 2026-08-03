'use client';

import { memo } from 'react';
import Image from 'next/image';

import { motion } from 'motion/react';

import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionQuery } from '~entities/subscription/model/api/queries';
import { SubscriptionModal } from '~features/сhoose-subscription-method/ui/subscription-modal';
import { BackgroundItem } from '~pages/(user)/subscribe-tab/ui/background-item';
import { ProfileSubscriptionBenefits } from '~pages/(user)/subscribe-tab/ui/profile-subscription-benefit';
import { SubscriptionFaq } from '~pages/(user)/subscribe-tab/ui/subscription-faq';
import { SubscriptionInfo } from '~pages/(user)/subscribe-tab/ui/subscription-info';
import { useLogged } from '~shared/lib/session/use-logged';

const WING_CONFIG = [
  //up
  {
    finalX: 60,
    finalY: 25,
    rotate: -8,
    delay: 0.3,
    offsetX: 20,
    offsetY: -10,
  },
  {
    finalX: 55,
    finalY: 20,
    rotate: 12,
    delay: 0.4,
    offsetX: 15,
    offsetY: -15,
  },
  {
    finalX: 65,
    finalY: 30,
    rotate: -15,
    delay: 0.5,
    offsetX: 25,
    offsetY: -5,
  },
  {
    finalX: 50,
    finalY: 35,
    rotate: 10,
    delay: 0.6,
    offsetX: 10,
    offsetY: -8,
  },

  // down
  {
    finalX: -15,
    finalY: 34,
    rotate: 180,
    delay: 0.35,
    offsetX: 10,
    offsetY: 0,
  },
  {
    finalX: -20,
    finalY: 50,
    rotate: 195,
    delay: 0.35,
    offsetX: 0,
    offsetY: 0,
  },
  {
    finalX: -25,
    finalY: 40,
    rotate: 200,
    delay: 0.35,
    offsetX: 10,
    offsetY: 0,
  },
  {
    finalX: -30,
    finalY: 55,
    rotate: 195,
    delay: 0.5,
    offsetX: 10,
    offsetY: 0,
  },
];
const renderBenefitsBackgrounds = () => {
  return (
    <>
      {/*1/3*/}
      <BackgroundItem
        width="93"
        height="93"
        src="/subscription/subscribeShootingStar.webp"
        alt="ShootingStar"
        className={cn(
          'pointer-events-none absolute -top-[5%] rotate-180 opacity-[0.3] select-none md:-top-[20%] dark:opacity-[0.011]'
        )}
      />
      <BackgroundItem
        width={117}
        height={117}
        className={cn(
          'pointer-events-none absolute -top-[90px] -right-[10px] size-[86px] -rotate-45 opacity-[0.3] select-none md:-top-[118px] md:size-[117px] dark:opacity-[0.011]'
        )}
        alt="SubscribeStar"
        src="/subscription/subscribeStar.webp"
      />
      {/*  2/3*/}
    </>
  );
};
export const SubscribeHeading = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative m-auto aspect-square w-full max-w-[67%] select-none md:max-w-[443px]"
    >
      <Image
        alt="Characters"
        src="/subscription/girl-and-boy.webp"
        width={443}
        height={443}
        className="user-event-none pointer-events-none relative z-20 select-none"
      />

      <div className="absolute inset-0 z-10 select-none">
        {WING_CONFIG.map((wing, index) => (
          <motion.div
            key={index}
            className="user-event-none pointer-events-none absolute aspect-[1.488] w-1/2 w-[250px] max-w-[250px] select-none max-[600px]:max-w-[190px] max-[450px]:w-[140px]"
            style={{
              left: '50%',
              top: '50%',
              rotate: wing.rotate,
              x: '-50%',
              y: '-50%',
              zIndex: 5,
            }}
            initial={{
              opacity: 0,
              left: '50%',
              top: '50%',
            }}
            animate={{
              left: `${wing.finalX}%`,
              top: `${wing.finalY}%`,
              opacity: 1,
              x: `${wing.offsetX}%`,
              y: `${wing.offsetY}%`,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              mass: 0.8,
              stiffness: 80,
              delay: wing.delay,
              duration: 1.2,
            }}
          >
            <Image
              src="/subscription/wing.webp"
              alt="Wing"
              width={250}
              height={168}
              className="user-event-none pointer-events-none object-contain"
            />
          </motion.div>
        ))}
      </div>
      <BackgroundItem
        width="124"
        height="124"
        src="/subscription/subscribeStarsV2.webp"
        alt="subscribeStars"
        className="top-0 -left-[24%] size-[95px] rotate-[-127deg] opacity-[0.3] md:-left-[34%] md:size-[124px] dark:opacity-[0.011]"
      />
      <BackgroundItem
        width="93"
        height="93"
        src="/subscription/subscribeShootingStar.webp"
        alt="SubscribeShootingStar"
        className={cn(
          'pointer-events-none absolute -right-[30%] bottom-0 opacity-[0.3] select-none dark:opacity-[0.011]'
        )}
      />
    </motion.div>
  );
};
const StickyActions = () => {
  const isLogged = useLogged();
  const { isLoading: isSubscriptionLoading } = useSubscriptionQuery({
    variables: {},
  });
  return (
    <div className="sticky bottom-[80px] z-[1000] mt-4 flex w-full items-center justify-center md:bottom-4">
      <motion.div
        initial={{ opacity: Number(!isLogged) }}
        variants={{
          visible: { opacity: 100, x: 0 },
          hidden: { opacity: 0, x: -100 },
        }}
        animate={isSubscriptionLoading ? 'hidden' : 'visible'}
      >
        <SubscriptionModal className="shadow-primary/50 h-10 shadow-xl inset-shadow-xs inset-shadow-black/50" />
      </motion.div>
    </div>
  );
};
export const SubscribeSection = memo(() => {
  return (
    <div className="relative min-h-screen space-y-4 overflow-clip p-4 pb-10">
      <div className="flex flex-col items-center">
        <SubscriptionInfo />
      </div>
      <ProfileSubscriptionBenefits
        className="m-auto mt-[100px] mb-6 max-w-[831px] md:mt-12"
        float={renderBenefitsBackgrounds}
      />
      <StickyActions />
      <SubscriptionFaq className="col-span-6 m-auto mt-6 max-[730px]:max-w-[600px] min-[731px]:max-w-[831px]" />
    </div>
  );
});
