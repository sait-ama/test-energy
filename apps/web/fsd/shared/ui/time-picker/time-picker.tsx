import { cn } from '@re/ui-kit/utils/cn';

import type { TimePickerInputProps } from './time-picker-input';
import { TimePickerInput } from './time-picker-input';

export interface TimePicker extends Pick<TimePickerInputProps, 'date' | 'setDate'> {
  className?: string;
  withHours?: boolean;
  withMinutes?: boolean;
  withSeconds?: boolean;
}

export const TimePicker = ({
  date,
  setDate,
  className,
  withHours,
  withMinutes,
  withSeconds,
}: TimePicker) => (
  <div className={cn('flex items-end gap-2', className)}>
    {withHours ? <TimePickerInput picker="hours" date={date} setDate={setDate} /> : null}
    {withMinutes ? <TimePickerInput picker="minutes" date={date} setDate={setDate} /> : null}
    {withSeconds ? <TimePickerInput picker="seconds" date={date} setDate={setDate} /> : null}
  </div>
);
