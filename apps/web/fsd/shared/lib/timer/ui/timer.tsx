import { ComponentProps, FC } from 'react';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { FormattedTimeParts } from '~shared/lib/timer/model/types';
import { useTimerWithIntl } from '~shared/lib/timer/model/use-timer-with-intl';

interface TimerSlotProps extends ComponentProps<'div'> {
  count: string;
  label: string;
}

const convertMonth2Days = (formattedParts: FormattedTimeParts) => {
  formattedParts.days.value += formattedParts.months.value * 30;
  formattedParts.months.value = 0;
  formattedParts.months.isSignificant = false;
  return formattedParts;
};
export const TimerSlot = ({ className, count, label }: TimerSlotProps) => {
  return (
    <div
      className={cn(
        'bg-background/30 border-border flex h-7 items-center justify-center gap-[2px] border px-2 py-[4px] first:rounded-l-[8px] last:w-[55px] last:rounded-r-[8px]',
        className
      )}
    >
      <ReText className="opacity-90" weight="semibold" size="md">
        {count}
      </ReText>
      <ReText
        align="end"
        weight="regular"
        size="xs"
        className="text-accent-foreground/60 h-[17px] self-end text-center leading-[20px]"
      >
        {label}
      </ReText>
    </div>
  );
};

interface TextTimerProps {
  targetDate: string;
  className?: string;
  onComplete?: () => void;
  showLabels?: boolean;
}

interface TimerSlotProps extends ComponentProps<'div'> {
  count: string;
  label: string;
}

interface TextTimerProps {
  targetDate: string;
  className?: string;
  onComplete?: () => void;
  showLabels?: boolean;
}

interface TimePart {
  value: string;
  label: string;
  type: keyof FormattedTimeParts;
  isSignificant?: boolean;
}

export const TextTimer: FC<TextTimerProps> = ({
  targetDate,
  className = '',
  onComplete,
  showLabels = true,
}) => {
  const { getFormattedParts, isCompleted } = useTimerWithIntl(targetDate, {
    onComplete,
    autoStart: true,
  });

  if (isCompleted) {
    return null;
  }

  const formattedParts = convertMonth2Days(getFormattedParts(false));
  const formatTimeWithColon = (): TimePart[] => {
    const parts: TimePart[] = [];
    for (const p in formattedParts) {
      const part = p as keyof typeof formattedParts;
      const isMainPart = part !== 'years';
      const value = formattedParts[part].value.toString();
      const shouldDisplay = part === 'seconds' || formattedParts[part].isSignificant;
      if (shouldDisplay) {
        parts.push({
          type: part,
          value: isMainPart ? value.padStart(2, '0') : value,
          label: formattedParts[part].label,
        });
      }
    }

    return parts;
  };

  const timeParts = formatTimeWithColon();

  if (timeParts.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-baseline', className)}>
      {timeParts.map((part, index) => (
        <div key={`${part.label}-${index}`} className="flex items-baseline">
          <div className="flex flex-col items-center">
            <ReText
              weight="semibold"
              className={cn(
                'text-accent-foreground flex items-center justify-center text-4xl leading-[30px] leading-none opacity-90',
                { 'mr-2': part.type === 'years' }
              )}
            >
              {part.value}
            </ReText>

            {showLabels && (
              <ReText
                weight="regular"
                size="md"
                className={cn('text-accent-foreground/40 flex self-center leading-none')}
              >
                {part.label}
              </ReText>
            )}
          </div>

          {part.type !== 'years' && index < timeParts.length - 1 && (
            <ReText
              weight="semibold"
              className={cn('text-accent-foreground text-4xl leading-none')}
            >
              {`${String.fromCharCode(160)}:${String.fromCharCode(160)}`}
            </ReText>
          )}
        </div>
      ))}
    </div>
  );
};
