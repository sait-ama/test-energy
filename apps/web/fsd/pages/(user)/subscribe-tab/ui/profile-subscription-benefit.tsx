'use client';
import React, { ComponentProps, memo, ReactNode, useRef } from 'react';

import { motion, useInView } from 'motion/react';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSubscriptionBenefits } from '~entities/subscription/model/api/utils';
import { type ProfileSubscriptionBenefitItem } from '~pages/(user)/subscribe-tab/model/constants';
import { SectionTitle } from '~shared/ui/section';

const BackgroundWithRadial = memo(() => {
  return (
    <div className="absolute inset-0 z-1 overflow-hidden">
      <div className="to-bg-background absolute inset-0 z-10 rounded-md bg-radial-[at_25%_25%] from-[#5DAAAE] to-75% opacity-[0.5] dark:to-zinc-900"></div>
      <div className="absolute inset-0 bottom-[14px] left-[34%] size-24 rounded-full bg-[radial-gradient(at_center,#DC4897,transparent)] blur-2xl" />
      <div className="to-bg-background absolute inset-0 bottom-5 z-10 rotate-194 rounded-md bg-radial-[at_25%_25%] from-[#A363F4] to-75% opacity-[0.5] blur-xl dark:to-zinc-900"></div>
      <div className="to-bg-background absolute z-10 rounded-md bg-radial-[at_100%_100%] from-[#63D1F4] to-75% opacity-[0.5] dark:to-zinc-900"></div>
      <div className="to-bg-background absolute z-10 rounded-md bg-radial-[at_25%_25%] from-[#DC4897] to-75% opacity-[0.5] dark:to-zinc-900"></div>
    </div>
  );
});
const ProfileSubscriptionBenefit = ({
  name,
  icon: Icon,
  description,
  shouldAlwaysBeInView = false,
  className,
}: ProfileSubscriptionBenefitItem & ComponentProps<'div'>) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(viewRef, { once: true }) || shouldAlwaysBeInView;

  return (
    <motion.div
      layout
      ref={viewRef}
      initial={{ opacity: !shouldAlwaysBeInView ? 0 : 1, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-primary border-t-border relative h-[188px] rounded-t-md rounded-b-md',
        className
      )}
    >
      {React.cloneElement(Icon, {
        key: name,
        className: cn(
          'absolute user-event-none select-none pointer-events-none left-1/2  elect-none pointer-events-none user-event-none top-[-45px] -translate-x-1/2 w-[164px] h-[164px] ',
          Icon.props.className
        ),
      })}

      <div className="border-border bg-background absolute -bottom-[1px] z-100 flex h-[130px] w-full flex-1 flex-col items-start gap-1.5 overflow-hidden rounded-t-md rounded-b-md border px-4 pt-3 dark:bg-black">
        <motion.div
          className="z-100"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle className="z-100 text-[20px] leading-[19px] font-semibold">
            {name}
          </SectionTitle>
        </motion.div>
        <motion.div
          className="z-100"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ReText color="muted-foreground" className="z-100 text-sm">
            {description}
          </ReText>
        </motion.div>
        <BackgroundWithRadial />
      </div>
    </motion.div>
  );
};
export const ProfileSubscriptionBenefits = ({
  float,
  className,
}: { float?: ReactNode | (() => ReactNode) } & ComponentProps<'div'>) => {
  const benefits = useSubscriptionBenefits();
  const remainder = benefits.length % 3;
  const smRemainder = benefits.length % 2;
  return (
    <div className={cn('relative mt-[100px] space-y-2 px-4 sm:px-0', className)}>
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-14 rounded-md max-[855px]:grid-cols-4 min-[856px]:grid-cols-6 sm:grid sm:items-stretch sm:justify-stretch sm:gap-x-3 sm:gap-y-14'
        )}
      >
        {benefits.map((benefit, index) => (
          <ProfileSubscriptionBenefit
            shouldAlwaysBeInView={false}
            key={benefit.name}
            className={cn(
              'col-span-2 mx-auto w-full max-w-[404px] min-w-[269px]',
              {
                'min-[856px]:col-span-3': remainder >= 2 && benefits.length - index <= 2,
              },
              {
                'max-[855px]:col-span-4': smRemainder !== 0 && index === benefits.length - 1,
              }
            )}
            {...benefit}
          />
        ))}
      </div>
      {typeof float === 'function' ? float() : float}
    </div>
  );
};
