import { cloneElement, isValidElement, ReactNode, useState } from 'react';
import NextImage, { ImageProps } from 'next/image';

import TicketBonusIcon from '@re/ui-kit/icons/ticket-bonus';
import { cn } from '@re/ui-kit/utils/cn';
import { motion } from 'motion/react';

import { UrlFormatter } from '~shared/utils/url-formatter';

type State = {
  lt: boolean;
  lb: boolean;
  rt: boolean;
  rb: boolean;
};

type SourcesKeys = 'lt' | 'lb' | 'rb' | 'rt';

type SourcesRec = {
  [k in SourcesKeys]?: {
    src?: string;
    landedClassName?: string;
    content?: ReactNode;
  };
};

interface BackgroundFallingItemsProps {
  sources?: SourcesRec;
}

export function BackgroundFallingItems({ sources }: BackgroundFallingItemsProps) {
  const { lt, lb, rb, rt } = sources ?? {};
  const [landed, setLanded] = useState<State>({
    lt: false,
    lb: false,
    rt: false,
    rb: false,
  });

  const markLanded = (id: keyof State) => setLanded((s) => ({ ...s, [id]: true }));

  const makeTransition = (index: number, stiffness = 90, damping = 14, delay = 0) => ({
    type: 'spring' as const,
    stiffness,
    damping,
    mass: 0.9,
    delay: delay + index * 0.12,
  });

  const getContent = (position: SourcesKeys, defaultContent: ReactNode) => {
    const source = sources?.[position];

    if (source?.content) {
      return source.content;
    }

    if (source?.src && isValidElement(defaultContent)) {
      return cloneElement(defaultContent, {
        ...(defaultContent.props ?? {}),
        // @ts-expect-error
        src: source.src,
      });
    }

    return defaultContent;
  };

  return (
    <>
      {/* Left Top */}
      <motion.div
        custom="30vw"
        initial={{ y: -750, x: '30vw', rotate: 20, opacity: 0 }}
        animate={{ y: -30, x: 0, rotate: 65, opacity: 1 }}
        transition={makeTransition(0, 100, 12, 0.05)}
        onAnimationComplete={() => markLanded('lt')}
        className={cn(
          'will-change-filter absolute -top-[5px] left-[5%] w-[125px] transition-[filter] duration-300 will-change-transform md:left-[9%] md:w-[26vw] md:max-w-[303px] md:min-w-[180px]',
          {
            'drop-shadow-[0_4px_30px_#93F22D]': landed.lt && !lt?.landedClassName,
            [lt?.landedClassName || '']: landed.lt && lt?.landedClassName,
          }
        )}
      >
        {getContent('lt', <TicketBonusIcon className="h-auto w-full select-none" />)}
      </motion.div>

      {/* Left Bottom */}
      <motion.div
        initial={{ y: -650, x: '-10vw', rotate: 10, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: -36.71, opacity: 1 }}
        transition={makeTransition(1, 90, 13, 0.15)}
        onAnimationComplete={() => markLanded('lb')}
        className={cn(
          'will-change-filter absolute bottom-[38%] left-[12%] w-[72px] max-w-[166px] transition-[filter] duration-300 will-change-transform md:bottom-[30%] md:min-w-[120px]',
          {
            'drop-shadow-[0_4px_30px_#FFD100]': landed.lb && !lb?.landedClassName,
            [lb?.landedClassName || '']: landed.lb && lb?.landedClassName,
          }
        )}
      >
        {getContent(
          'lb',
          <BackgroundPromoItem
            width={166}
            height={166}
            className="h-auto w-full select-none"
            src="/promocodes/gifts.png"
            alt=""
          />
        )}
      </motion.div>

      {/* Right Top */}
      <motion.div
        initial={{ y: -700, x: '40vw', rotate: -10, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: -54, opacity: 1 }}
        transition={makeTransition(2, 95, 15, 0.22)}
        onAnimationComplete={() => markLanded('rt')}
        className={cn(
          'will-change-filter absolute top-[6%] right-[40px] w-[72px] max-w-[176px] transition-[filter] duration-300 will-change-transform sm:left-[72%] md:left-[62%] md:min-w-[140px]',
          {
            'drop-shadow-[0_4px_30px_#FFD100]': landed.rt && !rt?.landedClassName,
            [rt?.landedClassName || '']: landed.rt && rt?.landedClassName,
          }
        )}
      >
        {getContent(
          'rt',
          <BackgroundPromoItem
            width={176}
            height={176}
            className="h-auto w-full select-none"
            src="/promocodes/fires.png"
            alt=""
          />
        )}
      </motion.div>

      {/* Right Bottom */}
      <motion.div
        initial={{ y: -800, x: '50vw', rotate: -24, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: -64, opacity: 1 }}
        transition={makeTransition(3, 85, 14, 0.28)}
        onAnimationComplete={() => markLanded('rb')}
        className={cn(
          'will-change-filter absolute right-[22%] bottom-[25%] w-[43px] max-w-[103px] transition-[filter] duration-300 will-change-transform md:bottom-[6%] md:w-[6.5vw] md:min-w-[86px]',
          {
            'drop-shadow-[0_4px_30px_#93F22D]': landed.rb && !rb?.landedClassName,
            [rb?.landedClassName || '']: landed.rb && rb?.landedClassName,
          }
        )}
      >
        {getContent('rb', <TicketBonusIcon className="h-auto w-full select-none" />)}
      </motion.div>
    </>
  );
}

export const BackgroundPromoItem = ({
  className,
  width,
  height,
  alt,
  mediaServer = false,
  src,
  ...props
}: ImageProps & { mediaServer?: boolean }) => {
  return (
    <NextImage
      loading="lazy"
      priority={false}
      width={width}
      height={height}
      src={mediaServer ? UrlFormatter.media(src) : src}
      alt={alt}
      className={cn('pointer-events-none absolute select-none', className)}
      {...props}
    />
  );
};
