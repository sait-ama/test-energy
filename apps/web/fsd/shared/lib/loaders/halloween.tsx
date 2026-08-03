'use client';
import { HalloweenItem } from '@re/ui-kit/icons/hellowen-item';
import { motion } from 'motion/react';

export const HalloweenLoader = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div className="relative">
        <svg
          width={256}
          height={256}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_15px_hsl(var(--halloween-primary))]"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--r-primary))"
            strokeWidth="8"
            strokeDasharray="70 30"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ rotate: 0, opacity: 0.7 }}
            animate={{
              rotate: 360,
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        </svg>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ y: 0 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <HalloweenItem className="h-12 w-12 drop-shadow-[0_0_10px_hsl(var(--halloween-primary))]" />
        </motion.div>
      </div>
    </div>
  );
};
