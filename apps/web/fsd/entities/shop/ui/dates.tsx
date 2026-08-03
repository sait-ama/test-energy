import { FC, Fragment, memo } from 'react';
import { useTranslations } from 'next-intl';

import { createContext } from '@re/core/utils/create-context';
import ClockGreen from '@re/ui-kit/icons/clock-green';
import ClockRed from '@re/ui-kit/icons/clock-red';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import dayjs from 'dayjs';
import DayJSIsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import DayJSIsSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { ShopItemTypes } from '~shared/api/models/shop';
import { UseTimerOptions } from '~shared/lib/timer/model/types';
import {
  calculateTimeLeftInSeconds,
  formatDuration,
  useTimer,
} from '~shared/lib/timer/model/use-timer';
import { NoSSR } from '~shared/ui/no-ssr';

dayjs.extend(DayJSIsSameOrAfter);
dayjs.extend(DayJSIsSameOrBefore);

interface ShopTimeFutureProps extends ButtonProps {}
export const ShopTimeFuture: FC<ShopTimeFutureProps> = ({ className, children, ...props }) => {
  return (
    <Button
      startIcon={<ClockGreen size={16} />}
      className={cn(className, 'user-events-none h-[32px] backdrop-blur-lg select-none')}
      variant="secondary"
      {...props}
    >
      {children}
    </Button>
  );
};
interface ShopTimePastProps extends ButtonProps {}
export const ShopTimePast: FC<ShopTimePastProps> = ({ className, children, ...props }) => {
  return (
    <Button
      startIcon={<ClockRed size={16} />}
      className={cn(className, 'user-events-none h-[32px] backdrop-blur-lg select-none')}
      variant="secondary"
      {...props}
    >
      {children}
    </Button>
  );
};
interface ShopFeedItemTimeProps extends ButtonProps {
  startDate?: string | null;
  endDate?: string | null;
  type: ShopItemTypes | null;
  shopItemId: number;
}

export const useShopItemByDateStatus = ({
  startDate,
  endDate,
  tz = 'Europe/Moscow',
}: {
  startDate?: string | null;
  endDate?: string | null;
  tz?: string;
}) => {
  const nowUtc = dayjs().tz(tz).utc();
  const startDateUtc = startDate ? dayjs(startDate).utc() : null;
  const endDateUtc = endDate ? dayjs(endDate).utc() : null;
  if (startDateUtc && startDateUtc.isAfter(nowUtc)) {
    return 'soon';
  }
  if (endDateUtc && endDateUtc.isAfter(nowUtc)) {
    return 'yet';
  }
  return 'infinite-or-past';
};
const TimerSlot = memo(({ count, timePart }: { count: number; timePart: string }) => {
  const t = useTranslations('reusable.timer');

  return (
    <Fragment>
      <ReText key={count} className="inline">
        {count}
      </ReText>
      {String.fromCharCode(160)}
      <ReText
        key={count + timePart}
        className="dark:text-muted-foreground/70 inline"
        color="accent-foreground"
      >
        {t(timePart, { count })}
      </ReText>
    </Fragment>
  );
});
const SimpleTimer = ({
  targetDate,
  options,
}: {
  targetDate: string | dayjs.Dayjs;
  options?: UseTimerOptions;
}) => {
  const {
    timeLeft: { durationSeconds },
  } = useTimer(targetDate, options);
  const timeParts = formatDuration(durationSeconds);
  if (!timeParts?.count) return null;
  const { count, timePart } = timeParts;
  return <TimerSlot count={count} timePart={timePart} key={`timer-${count}-${timePart}`} />;
};
export type ShopFeedTimerDepsStore = {
  onCompleteTimer?: (dateField: 'endDate' | 'startDate') => void;
};
export const { useStore: useShopFeedTimerDeps, Provider: ShopFeedItemTimerDepsProvider } =
  createContext<ShopFeedTimerDepsStore, ShopFeedTimerDepsStore>((v) => {
    return v;
  });
export const ShopFeedItemTime = ({
  className,
  shopItemId,
  type,
  ...props
}: ShopFeedItemTimeProps) => {
  'use no memo';
  const { endDate, startDate } = props;
  const salesStatus = useShopItemByDateStatus({ endDate, startDate });
  const { onCompleteTimer } = useShopFeedTimerDeps();
  if (salesStatus !== 'yet' && salesStatus !== 'soon') return null;
  const dateField =
    salesStatus === 'soon' && startDate
      ? 'startDate'
      : salesStatus === 'yet' && endDate
        ? 'endDate'
        : null;
  if (!dateField) return null;
  const onComplete = () => {
    if (dateField) onCompleteTimer?.(dateField);
  };

  const date = (dateField && props[dateField]) ?? null;
  const timeParts = !date
    ? null
    : formatDuration(calculateTimeLeftInSeconds(dayjs().utc(), dayjs(date).utc()));
  if (!timeParts) return null;
  const { timePart, count } = timeParts;
  if (!count) return null;
  const showTimer = (timePart === 'minutes' || timePart === 'seconds') && !!date;

  const Icon = salesStatus === 'soon' ? ClockGreen : ClockRed;
  return (
    <Button
      startIcon={<Icon size={16} />}
      className={cn(
        className,
        'user-events-none bg-background/30 h-[32px] !px-3 backdrop-blur-lg select-none'
      )}
      variant="secondary"
      {...props}
    >
      {showTimer ? (
        <NoSSR>
          <SimpleTimer targetDate={date} options={{ autoStart: true, onComplete }} />
        </NoSSR>
      ) : (
        <TimerSlot count={count} timePart={timePart} />
      )}
    </Button>
  );
};
