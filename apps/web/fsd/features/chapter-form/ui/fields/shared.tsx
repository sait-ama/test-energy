import { useState } from 'react';

import dayjs from 'dayjs';

//todo
import { Button } from '@re/ui-kit/ui/button';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import { Switch } from '@re/ui-kit/ui/switch';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { Calendar } from '~shared/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { TimePicker } from '~shared/ui/time-picker/time-picker';
import { NArray } from '~shared/utils/NArray';

import { useChapterContext } from '../../model/store';

interface FieldProps {
  name: string;
  className?: string;
  disabled?: boolean;
}

export const TomField = ({ name, className, disabled }: FieldProps) => {
  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Том</FormLabel>
          <FormControl>
            <Input
              placeholder="Том"
              {...field}
              disabled={disabled}
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  field.onChange(null);
                  return;
                }

                const valueAsNumber = Number(e.target.value);

                if (Number.isFinite(valueAsNumber)) {
                  field.onChange(valueAsNumber);
                }
              }}
              className=""
              type="number"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ChapterField = ({ name, className, disabled }: FieldProps) => {
  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Глава</FormLabel>
          <FormControl>
            <Input disabled={disabled} placeholder="Глава" {...field} className="" type="text" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const NameField = ({ name, className, disabled }: FieldProps) => {
  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Название</FormLabel>
          <FormControl>
            <Input
              disabled={disabled}
              placeholder="Название"
              {...field}
              value={field.value || ''}
              type="text"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PublishersField = ({ name, className, disabled }: FieldProps) => {
  const constants = useChapterContext((v) => v.constants);

  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Паблишеры</FormLabel>
          <FormControl>
            <MultiSelector
              disabled={disabled}
              values={field.value ?? []}
              onValuesChange={field.onChange}
            >
              <MultiSelectorTrigger
                labelResolver={NArray.newBy(constants.publishers).recordBy(
                  //@ts-ignore
                  (v) => v?.id,
                  //@ts-ignore
                  (v) => v?.name
                )}
              >
                <MultiSelectorInput placeholder="Паблишеры" />
              </MultiSelectorTrigger>
              <MultiSelectorContent>
                <MultiSelectorList>
                  {constants.publishers.map((it) => (
                    <MultiSelectorItem value={it.id} key={it.id}>
                      {it.name}
                    </MultiSelectorItem>
                  ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            </MultiSelector>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const IsPaidField = ({ name, className, disabled }: FieldProps) => {
  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex h-10 items-center gap-4">
            <FormControl>
              <Switch
                disabled={disabled}
                checked={!!field.value}
                onCheckedChange={(v) => {
                  field.onChange(Number(!!v));
                }}
              />
            </FormControl>
            <ReText weight="medium">Платная?</ReText>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PriceField = ({ name, className, disabled }: FieldProps) => {
  return (
    <FormField
      name={name}
      key={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>Цена</FormLabel>
          <FormControl>
            <Input
              disabled={disabled}
              placeholder="Цена"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const { value } = e.target;

                if (Number.isFinite(Number(value))) {
                  field.onChange(value);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PublishDateField = ({ name, className, disabled }: FieldProps) => {
  const datetimeFormat = useSiteConfig((v) => v.localization.datetimeFormat);
  const constants = useChapterContext((v) => v.constants);

  const [open, setOpen] = useState(false);

  if (constants.isPublished) return null;

  return (
    <FormField
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={className}>
            <FormLabel>Дата публикации</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button disabled={disabled} variant="secondary" size="lg" className="w-full">
                    {field.value ? (
                      dayjs(field.value).format(datetimeFormat)
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Calendar
                  defaultMonth={field.value ? new Date(field.value) : new Date()}
                  captionLayout="dropdown-buttons"
                  mode="single"
                  selected={field.value ? dayjs(field.value).toDate() : undefined}
                  onSelect={(value) => {
                    field.onChange(value ? dayjs(value).format('YYYY-MM-DD H:mm') : undefined);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  onDayClick={() => setOpen(false)}
                  toYear={dayjs().year() + 1}
                  fromYear={dayjs().year()}
                />

                <div className="flex w-full items-center justify-between gap-2 p-3 pt-0">
                  <TimePicker
                    withHours
                    withMinutes
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(value) => {
                      //todo do not set dateformat such as HH:mm
                      field.onChange(value ? dayjs(value).format('YYYY-MM-DD H:mm') : undefined);
                    }}
                  />
                  <Button
                    color="secondary"
                    onClick={() => {
                      field.onChange(null);
                    }}
                  >
                    Сбросить
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {/* <FormDescription>Дата, когда глава будет опубликована</FormDescription> */}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export const PaidExpirationDateField = ({ name, className, disabled }: FieldProps) => {
  const datetimeFormat = useSiteConfig((v) => v.localization.datetimeFormat);

  const [open, setOpen] = useState(false);

  return (
    <FormField
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={className}>
            <FormLabel>Дата, когда станет бесплатной</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button disabled={disabled} variant="secondary" size="lg" className="w-full">
                    {field.value ? (
                      dayjs(field.value).format(datetimeFormat)
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Calendar
                  defaultMonth={field.value ? new Date(field.value) : new Date()}
                  captionLayout="dropdown-buttons"
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(value) => {
                    field.onChange(value ? dayjs(value).format('YYYY-MM-DD H:mm') : undefined);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  onDayClick={() => setOpen(false)}
                  toYear={dayjs().year() + 1}
                  fromYear={dayjs().year()}
                />

                <div className="flex w-full items-center justify-between gap-2 p-3 pt-0">
                  <TimePicker
                    withHours
                    withMinutes
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(value) => {
                      //todo do not set dateformat such as HH:mm
                      field.onChange(value ? dayjs(value).format('YYYY-MM-DD H:mm') : undefined);
                    }}
                  />
                  <Button
                    color="secondary"
                    onClick={() => {
                      field.onChange(null);
                    }}
                  >
                    Сбросить
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {/* <FormDescription>Дата выхода в бесплатный доступ</FormDescription> */}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
