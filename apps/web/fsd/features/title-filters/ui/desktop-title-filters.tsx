import type { ChangeEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import dayjs from 'dayjs';

import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { FilterSchema } from '~features/title-filters/model/const';
import { useCatalogOptions } from '~features/title-filters/model/context';
import type { Type } from '~shared/api/models/forms';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { NArray } from '~shared/utils/NArray';

export const SelectDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control } = useFormContext();
  const options = useCatalogOptions()[filter.key];

  const nameByValueMap = NArray.newBy(options).recordBy(
    (v) => v.id,
    (v) => v.name
  );

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel className="mb-1 ml-1 text-sm font-semibold">{filter.name}</FormLabel>
            <FormControl>
              <MultiSelector
                values={field.value ?? []}
                onValuesChange={field.onChange}
                className="max-w-xs"
              >
                <MultiSelectorTrigger labelResolver={nameByValueMap}>
                  <div className="text-muted-foreground text-sm">Выберите значения</div>
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorInput
                    placeholder="Поиск..."
                    className="border-border mb-1 border-b px-1 pb-2"
                  />
                  <MultiSelectorList>
                    {options.map((it) => (
                      <MultiSelectorItem value={String(it.id)} key={it.id}>
                        {it.name}
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
};

export const RadioDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control } = useFormContext();
  const options = useCatalogOptions()[filter.key];

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="ml-1 font-semibold">{filter.name}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {options.map((it) => (
                <FormItem key={it.id} className="flex items-center space-y-0 space-x-3">
                  <FormControl>
                    <RadioGroupInputItem value={String(it.id)} />
                  </FormControl>
                  <FormLabel className="font-normal">{it.name}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const SliderDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control, setValue } = useFormContext();
  const options = useCatalogOptions()[filter.key];

  const gte = `${filter.field}_gte`;
  const lte = `${filter.field}_lte`;

  const gteValue = useWatch({ name: gte, control });
  const lteValue = useWatch({ name: lte, control });

  const isActiveOption = (option: Type) => {
    const [gteOption, lteOption] = String(option.id).split('-');
    const gteCond = gteOption ? gteOption == gteValue : true;
    const lteCond = lteOption ? lteOption == lteValue : true;
    return gteCond && lteCond;
  };

  const setResolvedValue = (option: Type) => {
    if (isActiveOption(option)) {
      setValue(lte, '');
      setValue(gte, '');
      return;
    }

    const [gteOption, lteOption] = String(option.id).split('-');

    setValue(gte, gteOption ?? '');
    setValue(lte, lteOption ?? '');
  };

  return (
    <div className="flex flex-col">
      <FormLabel className="ml-1 font-semibold">{filter.name}</FormLabel>

      <div className="flex gap-2">
        <FormField
          control={control}
          name={gte}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="От" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={lte}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="До" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-2 flex w-full gap-2">
        {options.map((it) => (
          <Button
            onClick={() => {
              setResolvedValue(it);
            }}
            variant={isActiveOption(it) ? 'default' : 'secondary'}
            className="flex-1"
            size="sm"
            key={it.name}
          >
            {it.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const CheckboxDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const options = useCatalogOptions()[filter.key];
  const { control } = useFormContext();

  return (
    <FormItem>
      <FormLabel className="ml-1 font-semibold">{filter.name}</FormLabel>

      <div className="mt-2 ml-1 flex flex-col gap-3">
        {options.map((it) => (
          <FormField
            key={it.id}
            control={control}
            name={filter.field}
            render={({ field }) => (
              <FormItem key={it.id} className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(it.id)}
                    onCheckedChange={(checked) => {
                      checked
                        ? field.onChange([...(field.value ?? []), it.id])
                        : field.onChange(field.value?.filter((value) => value !== it.id) ?? []);
                    }}
                  />
                </FormControl>
                <FormLabel
                  className={cn(
                    'font-normal',
                    !field.value?.includes(it.id) && 'text-muted-foreground'
                  )}
                >
                  {it.name}
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>

      <FormMessage />
    </FormItem>
  );
};

export const DateSliderDesktopFilterType = (props: { filter: FilterSchema }) => {
  const { filter } = props;
  const { control, setValue } = useFormContext();
  const options = useCatalogOptions()[filter.key];
  const serverDateFormat = useSiteConfig((v) => v.localization.serverDateFormat);

  const gte = `${filter.field}_gte`;
  const lte = `${filter.field}_lte`;

  const gteValue = useWatch({ name: gte, control });
  const lteValue = useWatch({ name: lte, control });

  const isActiveOption = (option: Type) => {
    const [gteOption, lteOption] = String(option.id).split('-');
    const gteCond = gteOption ? formatValue(gteOption) == gteValue : true;
    const lteCond = lteOption ? formatValue(lteOption) == lteValue : true;
    return gteCond && lteCond;
  };

  const setResolvedValue = (option: Type) => {
    if (isActiveOption(option)) {
      setValue(lte, '');
      setValue(gte, '');
      return;
    }

    const [gteOption, lteOption] = String(option.id).split('-');

    setValue(gte, gteOption ? formatValue(gteOption) : '');
    setValue(lte, lteOption ? formatValue(lteOption) : '');
  };

  const formatValue = (value: string) =>
    dayjs()
      .add(Number(value) * -1, 'day')
      .format(serverDateFormat);

  const createOnChange = (func: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const formattedValue = formatValue(value);

    let formValue = formattedValue;

    if (formattedValue === dayjs().format(serverDateFormat)) {
      formValue = '';
    }

    func(formValue);
  };

  return (
    <div className="flex flex-col">
      <FormLabel className="ml-1 font-semibold">{filter.name}</FormLabel>

      <div className="flex gap-2">
        <FormField
          control={control}
          name={gte}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onChange={createOnChange(field.onChange)}
                    value={
                      field.value ? dayjs().diff(dayjs(field.value, serverDateFormat), 'day') : ''
                    }
                    placeholder="От"
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={control}
          name={lte}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  onChange={createOnChange(field.onChange)}
                  value={
                    field.value ? dayjs().diff(dayjs(field.value, serverDateFormat), 'day') : ''
                  }
                  placeholder="До"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-2 flex w-full gap-2">
        {options.map((it) => (
          <Button
            onClick={() => {
              setResolvedValue(it);
            }}
            variant={isActiveOption(it) ? 'default' : 'secondary'}
            className="flex-1"
            size="sm"
            key={it.name}
          >
            {it.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
