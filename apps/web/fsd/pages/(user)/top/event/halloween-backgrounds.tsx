'use client';
import React from 'react';
import { useTheme } from 'next-themes';

import { HalloweenItem } from '@re/ui-kit/icons/hellowen-item';
import { Portal } from '@re/ui-kit/ui/portal';
import { motion } from 'motion/react';

export const HalloweenBackgrounds = () => {
  const { resolvedTheme } = useTheme();

  const finalOp = resolvedTheme === 'light' ? 0.6 : 1;

  return (
    <>
      <Portal.Root className="h-0 w-0">
        <>
          <motion.img
            src="/halloween/pautina_left.webp"
            alt="Left spider web"
            width={400}
            height={388}
            className="pointer-events-none absolute top-[60px] -left-3 opacity-40 min-[1018px]:fixed"
            initial={{
              x: -150,
              y: -80,
              opacity: 0.1,
              rotate: -15,
            }}
            animate={{
              x: [0, -5, 3, 0],
              y: [0, -3, 2, 0],
              opacity: finalOp,
              rotate: [0, 2, -1, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              times: [0, 0.4, 0.7, 1],
            }}
          />

          <motion.img
            src="/halloween/pautina_right.webp"
            alt="Right spider web"
            width={307}
            height={268}
            className="pointer-events-none absolute top-[20px] -right-5 hidden aspect-[1.14] w-[300px] opacity-40 min-[1018px]:fixed min-[1018px]:block md:w-[407px] dark:opacity-70"
            initial={{
              x: 150,
              y: -80,
              opacity: 0.1,
              rotate: 15,
            }}
            animate={{
              x: [0, 5, -3, 0],
              y: [0, -3, 2, 0],
              opacity: 1,
              rotate: [0, -2, 1, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: 0.2,
              times: [0, 0.4, 0.7, 1],
            }}
          />
        </>
      </Portal.Root>
      <motion.div
        className="absolute -top-[20px] right-[25px] z-100 h-[58px] w-[62px] -rotate-45 drop-shadow-[0_4px_30px_#FFD100] min-[1018px]:fixed min-[1018px]:top-[63%] min-[1018px]:right-auto min-[1018px]:left-[8%]"
        initial={{ y: -100, opacity: 0, rotate: 40, scale: 1 }}
        animate={{ y: 0, opacity: 1, rotate: 0, scale: 0.7 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 10,
          delay: 0.4,
        }}
      >
        <HalloweenItem className="z-100 h-full w-full" />
      </motion.div>

      <motion.div
        className="absolute top-[180px] right-0 z-100 hidden size-[102px] scale-70 -rotate-15 drop-shadow-[0_4px_30px_#FFD100] min-[1018px]:fixed min-[1018px]:top-auto min-[1018px]:right-[3%] min-[1018px]:bottom-[100px] min-[1018px]:block md:right-[5%]"
        initial={{ y: -100, opacity: 0, rotate: -40 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 10,
          delay: 0.6,
        }}
      >
        <HalloweenItem className="z-100 h-full w-full opacity-80 dark:opacity-40" />
      </motion.div>
    </>
  );
};
