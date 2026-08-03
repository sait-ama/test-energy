'use client';
import React, {
  ComponentProps,
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import NextImage, { ImageProps } from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { RipIcon } from '@re/ui-kit/icons/coffin';
import { GhostIcon } from '@re/ui-kit/icons/ghost';
import { HatIcon } from '@re/ui-kit/icons/hat-hallowen';
import { HalloweenItem } from '@re/ui-kit/icons/hellowen-item';
import PauseIcon from '@re/ui-kit/icons/pause';
import PlayIcon from '@re/ui-kit/icons/play';
import { VatIcon } from '@re/ui-kit/icons/vat-hallowen';
import { Avatar, AvatarImage } from '@re/ui-kit/ui/avatar';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Card } from '@re/ui-kit/ui/card';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import dayjs from 'dayjs';
import { motion } from 'motion/react';

import { useInView } from '~pages/(events)/halloween/model/hooks';
import { halloweenDates } from '~shared/lib/event-management/is-halloween';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { CardContent, CardFooter } from '~shared/ui/card';
import { LinearGradientBase } from '~shared/ui/linear-gradient';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { BgAudioStateProvider, useBgAudioState } from '../model/state';

type DecorateItem = { icon: React.ReactNode; variant: 'default' | 'flat' };

interface DecoratedButtonGroupProps {
  leftIcons: [DecorateItem, DecorateItem];
  reverse?: boolean;
}

const DecoratedButtonGroup: FC<DecoratedButtonGroupProps> = ({ leftIcons, reverse = false }) => {
  const icons = reverse ? [...leftIcons].reverse() : leftIcons;

  return (
    <span className={`relative flex h-10 w-15 items-center ${reverse ? 'flex-row-reverse' : ''}`}>
      {icons.map((item, index) => (
        <Button
          key={index}
          circle
          className={cn(
            'user-event-none cursor-auto select-none',
            { 'bg-[#717171] hover:bg-[#717171]': item.variant === 'default' },
            { 'bg-primary hover:bg-primary': item.variant !== 'default' },
            {
              'absolute right-[23px] z-2': index === 1 && reverse,
              'absolute left-[23px] z-3': index === 1 && !reverse,
              'z-1': index !== 1,
            }
          )}
          variant={item.variant}
          color={item.variant === 'default' ? 'primary' : 'gray'}
        >
          {item.icon}
        </Button>
      ))}
    </span>
  );
};
const defaultStrokedGradients = ['#6190BF', '#F0822C'];

export const StrokedText: React.FC<HalloweenTextProps> = ({
  children = 'HALLOWEEN',
  className = '',
  strokeWidth = 2,
  strokeColor = 'hsl(var(--r-primary))',
  strokeGradient,
  style,
  ...props
}) => {
  const baseId = React.useId();
  const gradientId = `stroke-gradient-${baseId}`;

  if (strokeGradient) {
    const gradientColors = Array.isArray(strokeGradient) ? strokeGradient : defaultStrokedGradients;

    return (
      <div
        className={`cursor-normal flex h-auto w-full flex-none grow-0 items-start justify-start self-stretch overflow-hidden text-left text-[82px] leading-[82px] font-extrabold whitespace-nowrap text-transparent uppercase italic select-none ${className}`}
        style={style}
        {...props}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 120"
          className="pointer-events-none overflow-visible select-none"
          preserveAspectRatio="xMinYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="95%"
            textAnchor="start"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fontFamily="Inter, sans-serif"
            className="text-[150px] whitespace-nowrap italic"
            letterSpacing="0"
            style={{ wordSpacing: '-2.5rem', fontWeight: 1000 }}
          >
            {children}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <p
      {...props}
      className={`cursor-normal flex w-full flex-none grow-0 items-start justify-start self-stretch overflow-visible text-left text-[58px] leading-[38px] font-extrabold whitespace-nowrap text-transparent uppercase select-none md:text-[72px] md:leading-[52px] ${className}`}
      style={{
        fontFamily: "'Inter', sans-serif",
        WebkitTextFillColor: 'transparent',
        WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
        fontWeight: 1000,
        ...style,
      }}
    >
      {children}
    </p>
  );
};
const SpiderWebs = ({ finalOp }: { finalOp: number }) => {
  return (
    <>
      <motion.img
        src="/halloween/pautina_left.webp"
        alt="Left spider webp"
        width={400}
        height={388}
        draggable={false}
        className="user-event-none pointer-events-none absolute -top-6 -left-3 z-1 opacity-40 select-none"
        initial={{ x: -150, y: -80, opacity: 0.1, rotate: -15 }}
        animate={{ x: [0, -5, 3, 0], y: [0, -3, 2, 0], opacity: finalOp, rotate: [0, 2, -1, 0] }}
        transition={{ duration: 0.8, ease: 'easeOut', times: [0, 0.4, 0.7, 1] }}
      />
      <Media greaterThanOrEqual={Display.md}>
        <motion.img
          src="/halloween/pautina_right.webp"
          alt="Right spider webp"
          width={307}
          height={268}
          draggable={false}
          className="user-event-none pointer-events-none invisible absolute -top-8 -right-5 z-2 aspect-[1.14] w-[300px] opacity-40 select-none md:visible md:w-[407px] dark:opacity-70"
          initial={{ x: 150, y: -80, opacity: 0.1, rotate: 15 }}
          animate={{ x: [0, 5, -3, 0], y: [0, -3, 2, 0], opacity: 1, rotate: [0, -2, 1, 0] }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2, times: [0, 0.4, 0.7, 1] }}
        />
      </Media>
    </>
  );
};

interface EventContainerProps extends ComponentProps<'div'> {}

interface AnimatedHalloweenItemProps extends ComponentProps<typeof motion.div> {
  size?: number;
}

const AnimatedHalloweenItem: FC<AnimatedHalloweenItemProps> = ({
  size = 62,
  className,
  ...props
}) => {
  return (
    <motion.div className={cn('drop-shadow-[0_4px_30px_#FFD100]', className)} {...props}>
      <HalloweenItem size={size} className="size-full" />
    </motion.div>
  );
};
export const BgMucic = () => {
  const play = useBgAudioState((v) => v.play);
  const isPlaying = useBgAudioState((v) => v.isPlaying);
  useEffect(() => {
    if (!isPlaying) {
      play();
    }
  }, []);
  return <Fragment key="bg-music" />;
};

const HeroImage = ({ onLoad }: { onLoad: Dispatch<SetStateAction<boolean>> }) => {
  const onSuccessLoad = () => {
    onLoad(true);
  };
  return (
    <motion.div
      className="flex h-full w-full items-center justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ willChange: 'opacity, transform' }}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <NextImage
          onLoad={onSuccessLoad}
          src="/halloween/witcher_girl.webp"
          alt="Witch girl"
          fill
          draggable={false}
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 70vw, 539px"
          className="user-event-none pointer-events-none z-100 translate-y-[-10px] object-contain select-none"
          priority
        />
      </div>
    </motion.div>
  );
};
const PauseSuspense = ({ className, ...props }: ButtonProps) => {
  const toggle = useBgAudioState((v) => v.toggle);
  const isPlaying = useBgAudioState((v) => v.isPlaying);
  const t = useTranslations('halloween.topSection');

  return (
    <Button
      className={cn('w-fit', className)}
      {...props}
      startIcon={isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
      variant="default"
      size="sm"
      onClick={toggle}
    >
      <ReText className="uppercase">{t('music-trigger')}</ReText>
    </Button>
  );
};
const EventTitle = () => {
  const t = useTranslations('halloween.topSection');
  const { endDate, endMonth } = halloweenDates;
  const locale = useLocale();
  const finalDate = dayjs(`1000-${endMonth}-${endDate}`).locale(locale).format('D MMMM');
  return (
    <>
      <span className="mx-auto mt-5 flex w-max items-center justify-center gap-4">
        <DecoratedButtonGroup
          leftIcons={[
            { icon: <VatIcon size={20} />, variant: 'flat' },
            {
              icon: <HatIcon fill="none" color="currentColor" size={20} />,
              variant: 'default',
            },
          ]}
        />

        <ReText
          align="center"
          className="block text-center text-xl font-semibold md:hidden md:text-2xl"
        >
          {t('halloween')}
        </ReText>
        <ReText
          align="center"
          className="hidden text-center text-xl font-semibold md:block md:text-2xl"
        >
          {t('halloweenEvent')}
        </ReText>

        <DecoratedButtonGroup
          leftIcons={[
            { icon: <GhostIcon size={20} />, variant: 'default' as const },
            { icon: <RipIcon size={20} />, variant: 'flat' as const },
          ]}
          reverse
        />
      </span>

      <ReText align="center" className="text-center text-xl font-semibold md:text-2xl">
        {t('openMagic')}
      </ReText>
      <ReText weight="regular" size="xs" className="text-card-foreground/60 mt-4" align="center">
        {t('eventDates', { dates: finalDate })}
      </ReText>
      <PauseSuspense className="mx-auto mt-4 py-3" />
    </>
  );
};

interface BackgroundStrokedTextProps extends ComponentProps<'div'> {
  count: number;
  text: string;
  strokeGradient?: boolean;
}

const BackgroundStrokedText: FC<BackgroundStrokedTextProps> = ({
  count,
  text,
  strokeGradient,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'absolute -top-4 left-0 flex size-full flex-col gap-2 overflow-visible opacity-20',
        className
      )}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <StrokedText key={index} strokeGradient={strokeGradient}>
          {text}
        </StrokedText>
      ))}
    </div>
  );
};

interface EpsiloneProps extends ComponentProps<'div'> {}

const Epsilone = ({ className, style, ...props }: EpsiloneProps) => {
  return (
    <div
      {...props}
      style={style}
      className={cn(
        'relative -z-10 aspect-square max-w-[90%]',
        "before:absolute before:inset-0 before:content-['']",
        'before:bg-[radial-gradient(50%_50%_at_50%_50%,transparent_62.41%,#F0822C_82.42%,transparent_100%)]',
        'before:opacity-20 before:blur-[25px]',
        'before:animate-pulse',
        className
      )}
    ></div>
  );
};

interface NoiseProps extends ComponentProps<'div'> {}

const Noise = ({ className, style, ...props }: NoiseProps) => {
  return (
    <div
      {...props}
      style={style}
      className={cn(
        'repeat absolute top-0 left-0 size-full bg-[url(/halloween/noise.webp)] mix-blend-soft-light',
        className
      )}
    />
  );
};

interface BackgroundItemProps extends ImageProps {
  mediaServer?: boolean;
  withOpacity?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

const BackgroundItem: FC<BackgroundItemProps> = ({
  className,
  width,
  height,
  alt,
  withOpacity = true,
  ref,
  mediaServer = false,
  src,
  ...props
}) => {
  return (
    <NextImage
      ref={ref}
      draggable={false}
      loading="lazy"
      priority={false}
      width={width}
      height={height}
      src={mediaServer ? UrlFormatter.media(src) : src}
      alt={alt}
      className={cn(
        `user-event-none pointer-events-none absolute opacity-100 select-none ${withOpacity ? 'dark:opacity-30' : ''}`,
        className
      )}
      {...props}
    />
  );
};

const Bat = () => {
  return (
    <>
      <div className="absolute top-[28px] right-[17%] z-[2001] aspect-[1.65] w-[18%] opacity-60 select-none dark:opacity-50">
        <NextImage
          draggable={false}
          className="user-event-none pointer-events-none select-none"
          src="/halloween/mouse.webp"
          alt="Mouse"
          width={245}
          height={148}
          priority
        />
      </div>

      <div className="absolute top-[88px] left-[17%] z-10 select-none">
        <NextImage
          draggable={false}
          src="/halloween/smile_face.webp"
          alt="Smiling face"
          width={124}
          height={124}
          priority
          className="user-event-none pointer-events-none select-none dark:opacity-100"
        />
      </div>
    </>
  );
};

const BackgroundItems = () => {
  const { resolvedTheme } = useTheme();
  const finalOp = resolvedTheme === 'light' ? 0.6 : 1;

  return (
    <>
      <Bat key="bat" />

      <AnimatedHalloweenItem
        className="absolute top-[45%] left-[3%] z-[3000] size-[62px] translate-y-[45%] scale-70 -rotate-[35deg] drop-shadow-[0_4px_30px_#FFD100] md:left-[12%] md:scale-100"
        initial={{ y: -100, opacity: 0, rotate: 40, scale: 0.7 }}
        animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.4 }}
        size={62}
      />

      <AnimatedHalloweenItem
        className="absolute top-0 right-5 z-[3000] h-[62px] w-[62px] scale-60 rotate-[35deg] drop-shadow-[0_4px_30px_#FFD100] md:top-auto md:right-[12%] md:bottom-0 md:scale-100"
        initial={{ y: -100, opacity: 0, rotate: -40, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.6 }}
        size={62}
      />

      <SpiderWebs finalOp={finalOp} />
    </>
  );
};

const GradientOverlays = () => {
  return (
    <>
      <div
        style={{
          background:
            'linear-gradient(180deg, rgba(9, 9, 11, 0) 0%, hsl(var(--r-background)) 100%)',
          transform: 'matrix(1, 0, 0, -1, 0, 0)',
        }}
        className="absolute -top-[3px] left-0 z-[1000] h-1/2 w-full"
      />
      <div
        style={{
          background:
            'linear-gradient(-180deg, rgba(9, 9, 11, 0) 0%, hsl(var(--r-background)) 100%)',
        }}
        className="absolute -bottom-[12px] left-0 z-[1000] h-[66%] w-full"
      />
    </>
  );
};

const BackgroundHouse = () => {
  return (
    <div className="absolute bottom-0 left-1/2 z-1 aspect-[1.55] h-full max-h-[931px] -translate-x-1/2 self-center overflow-clip lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-xl">
      <NextImage
        alt=""
        width={1440}
        height={931}
        draggable={false}
        src="/halloween/background-halloween-house-no-shadow.webp"
        className="user-event-none pointer-events-none h-full w-full translate-y-[50px] select-none"
      />
    </div>
  );
};
const BenefitCard: FC<BenefitCardProps> = ({ type, title, isInView, children }) => {
  const t = useTranslations('halloween.decoration');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      className="h-full"
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.5, delay: type === 'avatars' ? 0.2 : 0 }}
    >
      <Card className="border-primary/25 relative h-full max-w-[450px] overflow-clip border pt-6 pb-8">
        <CardContent withHover={false} className="flex items-center justify-center">
          {children}
        </CardContent>

        <CardFooter>
          <ReText size="md" weight="semibold" align="center">
            {title}
          </ReText>
        </CardFooter>
        <Noise />
        <BackgroundStrokedText count={14} text={t('halloween').repeat(2)} />
      </Card>
    </motion.div>
  );
};

interface BenefitCardProps extends ComponentProps<'div'> {
  type: 'cards' | 'avatars';
  title: string;
  isInView: boolean;
}

const AvatarsBenefitContent = () => {
  return (
    <span className="aspect-[1.35] w-[70%]">
      <Avatar
        src="/halloween/avatar.webp"
        className="mx-auto aspect-square h-full w-auto hover:opacity-100"
      >
        <AvatarImage
          alt=""
          draggable={false}
          className="rounded-sm object-cover hover:opacity-100"
        />
      </Avatar>
    </span>
  );
};

const CardsBenefitContent = () => {
  return (
    <Avatar src="/halloween/cards.png" className="aspect-[1.35] w-[70%] hover:opacity-100">
      <AvatarImage alt="" draggable={false} className="rounded-sm object-cover hover:opacity-100" />
    </Avatar>
  );
};

interface BenefitsProps extends ComponentProps<'div'> {}

const Benefits = ({ className, ...props }: BenefitsProps) => {
  const t = useTranslations('halloween.benefits');
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <div ref={ref} className={cn('z-200 mx-2 flex flex-col gap-10 md:mx-0', className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <ReText align="center" weight="bold" size="2xl" className="z-200 text-center">
          {t('title')}
        </ReText>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BenefitCard type="cards" title={t('cards')} isInView={isInView}>
          <CardsBenefitContent />
        </BenefitCard>
        <BenefitCard type="avatars" title={t('avatars')} isInView={isInView}>
          <AvatarsBenefitContent />
        </BenefitCard>
      </div>
    </div>
  );
};

const GiftCardHeader = ({ ref: observerRef }: { ref?: React.RefObject<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        'relative z-[1000] mx-auto aspect-square w-full p-0 opacity-100 dark:opacity-100',
        'max-w-[30vw] md:max-w-[16vw]',
        'before:absolute before:top-1/2 before:left-[40%] before:z-[999]',
        'before:h-[134%] before:w-[162%]',
        'before:-translate-x-1/2 before:-translate-y-1/2',
        'before:bg-[radial-gradient(50%_50%_at_50%_50%,_#6190BF_0%,_rgba(0,0,0,0)_100%)]',
        "before:opacity-25 before:content-['']",

        'after:absolute after:top-1/2 after:left-[64%] after:z-[999]',
        'after:h-[134%] after:w-[162%]',
        'after:-translate-x-1/2 after:-translate-y-1/2',
        'after:bg-[radial-gradient(50%_50%_at_50%_50%,_#F57F1F_0%,_rgba(0,0,0,0)_100%)]',
        "after:opacity-25 after:content-['']"
      )}
    >
      <BackgroundItem
        withOpacity={false}
        ref={observerRef}
        src="/halloween/hallowen_gift.webp"
        className={cn('z-[3000] size-full')}
        width={229}
        height={229}
        alt=""
      />
    </div>
  );
};

const FAQ = ({ ref: giftObserverRef }: { ref?: React.RefObject<HTMLDivElement> }) => {
  const t = useTranslations('halloween');
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      className="relative flex w-full flex-col items-center justify-center px-4"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7 }}
    >
      <ReText
        align="center"
        indent="5xl"
        size="3xl"
        weight="extrabold"
        className="mx-auto uppercase"
      >
        {t('faq.title')}
      </ReText>
      <div className="z-[5000] mx-auto w-[95vw] max-w-full rounded-md bg-gradient-to-r from-[#6190BF]/25 to-[#F0822C]/25 p-[2px] md:max-w-[596px] xl:w-full xl:max-w-[42%]">
        <Card className="relative h-full w-full self-center overflow-clip border-0 p-0">
          <Noise key="noise" />
          <BackgroundStrokedText
            className="z-[500]"
            key="bg-text"
            count={8}
            text={t('decoration.halloween-repeat')}
            strokeGradient
          />
          <GiftCardHeader ref={giftObserverRef} />
          <CardFooter className="mt-4 pb-8">
            <ReText className="z-100 mx-auto text-[18px]" align="center" weight="bold" size="lg">
              {t('faq.description')}
            </ReText>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};
const BottomBackgroundElements = ({ isInView }: { isInView: boolean }) => {
  const { resolvedTheme } = useTheme();
  const finalOp = resolvedTheme === 'light' ? 0.6 : 0.3;
  return (
    <>
      <AnimatedHalloweenItem
        className="absolute top-[30px] z-[3003] size-9 translate-y-[45%] scale-70 rotate-[47deg] sm:left-[7%] md:top-[45%] md:left-[8%] md:scale-100 lg:left-[12%]"
        initial={{ y: -100, opacity: 0, rotate: 40, scale: 0.7 }}
        animate={isInView ? { y: 0, opacity: 1, rotate: 0, scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.4 }}
        size={36}
      />

      <AnimatedHalloweenItem
        className="absolute right-[11%] bottom-4 z-[3001] size-[58px] -rotate-[24deg] md:size-[102px]"
        initial={{ y: -100, opacity: 0, rotate: 40, scale: 0.7 }}
        animate={isInView ? { y: 0, opacity: 1, rotate: 0, scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.4 }}
        size={102}
      />

      <motion.img
        width={1264}
        draggable={false}
        height={328}
        src="/halloween/grass.webp"
        alt="Grass"
        className="user-event-none pointer-events-none absolute bottom-0 left-0 z-[3000] aspect-[3.85] h-auto w-[90%] opacity-100 select-none dark:opacity-85"
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      />
      <Media greaterThanOrEqual={Display.md}>
        <BackgroundItem
          src="/halloween/crazy_moon.webp"
          alt="Crazy moon"
          width={288}
          height={222}
          className="invisible absolute left-0 scale-50 md:visible md:top-0 md:scale-70 dark:opacity-100"
        />
      </Media>

      <motion.img
        width={294}
        height={567}
        draggable={false}
        src="/halloween/tree_left.webp"
        alt="Left tree"
        className="user-event-none pointer-events-none absolute bottom-0 -left-0 z-2 aspect-[0.4] h-auto w-[20%] opacity-40 select-none dark:opacity-40"
        initial={{ x: -50, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: finalOp } : {}}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
      />

      <motion.img
        draggable={false}
        width={217}
        height={548}
        src="/halloween/tree_right.webp"
        alt="Right tree"
        className="user-event-none pointer-events-none absolute right-0 bottom-0 z-2 aspect-[0.4] h-[80%] w-auto opacity-50 select-none dark:opacity-70"
        initial={{ x: 50, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}
      />
      <Media greaterThanOrEqual={Display.md}>
        <motion.img
          draggable={false}
          src="/halloween/ghost.webp"
          alt="Floating ghost"
          width={145}
          height={188}
          className="user-event-none pointer-events-none absolute top-[88px] right-[16%] select-none dark:opacity-50"
          initial={{ y: -50, opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: 0.5,
                  y: [0, -20, 0],
                  x: [0, 5, -3, 0],
                }
              : {}
          }
          transition={{
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          whileHover={{
            scale: 1.1,
            opacity: 0.8,
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
            transition: { duration: 0.3 },
          }}
        />
      </Media>
      <div
        style={{
          background:
            'linear-gradient(-180deg, rgba(9, 9, 11, 0) 0%, hsl(var(--r-background)) 100%)',
        }}
        className="absolute -bottom-[12px] left-0 z-[4000] h-[86px] w-full md:h-[260px]"
      />
    </>
  );
};

const BottomSection = () => {
  const [giftRef, giftInView] = useInView({ threshold: 0.5, once: true });

  return (
    <div className="relative overflow-clip pb-[21%] md:pt-[177px]">
      <FAQ ref={giftRef} />
      <BottomBackgroundElements isInView={giftInView} />
    </div>
  );
};

interface HalloweenTextProps extends ComponentProps<'p'> {
  children?: React.ReactNode;
  className?: string;
  strokeWidth?: string;
  color?: string;
  strokeColor?: string;
  strokeGradient?: [string, string] | boolean;
  order?: number;
}

export const EventContainer = ({ className, children, ...props }: EventContainerProps) => {
  return (
    <div
      {...props}
      className={cn(
        'bg-background relative min-h-screen w-full space-y-4 overflow-visible overflow-x-clip p-0 pb-10',
        className
      )}
    >
      {children}
    </div>
  );
};

interface TopContainerProps extends ComponentProps<'div'> {}

const TopContainer: FC<TopContainerProps> = ({ className, children, ...props }) => {
  const [load, setOnLoad] = useState(false);
  return (
    <div className={cn(className, 'relative flex flex-col')} {...props}>
      <LinearGradientBase
        className={cn(
          'relative z-[999] m-auto h-[50vh] max-h-[600px] min-h-[300px] w-full overflow-x-visible overflow-y-clip after:bottom-[-5px] after:z-200 after:h-[70%]',
          'sm:h-[60vh] sm:max-w-[80vw]',
          'md:h-[65vh] md:max-w-[70vw]',
          'lg:h-[548px] lg:max-w-[787px]'
        )}
      >
        <HeroImage onLoad={setOnLoad} />
        {load && (
          <Epsilone
            key="outer"
            className="absolute top-[80%] left-1/2 aspect-square w-[90%] max-w-[90%] -translate-x-1/2 -translate-y-1/2 sm:w-[85%] md:w-[787px]"
          />
        )}
        {load && (
          <Epsilone
            key="inner"
            className="absolute top-[90%] left-1/2 aspect-square w-[60%] -translate-x-1/2 -translate-y-1/2 sm:w-[55%] md:w-[490px]"
          />
        )}
      </LinearGradientBase>
      <EventTitle key="top-title" />
      {children}
    </div>
  );
};

interface MiddleContainerProps extends ComponentProps<'div'> {}

const MiddleContainer = ({ className, children, ...props }: MiddleContainerProps) => {
  return (
    <div
      {...props}
      className={cn(
        'relative flex aspect-[1.55] w-full items-center justify-center bg-[#cf5a06] py-[23%] sm:py-0 md:max-h-[931px] dark:mix-blend-lighten',
        className
      )}
    >
      {children}
      <GradientOverlays key="overlays" />
      <BackgroundHouse key="bg-house" />
    </div>
  );
};
export const EventHalloweenPromoPage = () => {
  return (
    <BgAudioStateProvider value={undefined}>
      <EventContainer key="container" draggable={false} className="relative overflow-x-clip px-0">
        <TopContainer key="top" className="overflow-x-clip">
          <BackgroundItems key="top-bg-items" />
        </TopContainer>
        <MiddleContainer key="middle">
          <Benefits className="z-[2000]" key="middle-benefits" />
        </MiddleContainer>
        <BottomSection key="bottom" />
        <BgMucic key="bg-music" />
      </EventContainer>
    </BgAudioStateProvider>
  );
};
