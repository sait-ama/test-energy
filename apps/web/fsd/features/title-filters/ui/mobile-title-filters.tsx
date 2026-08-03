import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Check from '@re/ui-kit/icons/check';
import ChevronRight from '@re/ui-kit/icons/chevron-right';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import type { FilterSchema } from '~features/title-filters/model/const';
import { useCatalogOptions } from '~features/title-filters/model/context';
import { FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';
import { NArray } from '~shared/utils/NArray';

export const SelectMobileFilterType = (props: { filter: FilterSchema; onClick: () => void }) => {
  const { filter, onClick } = props;
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => {
        return (
          <FormItem className="bg-secondary/80 rounded-md p-3 pl-4" onClick={onClick}>
            <FormLabel className="mb-0 ml-1 flex items-center justify-between text-sm font-semibold">
              {filter.name}
              <span className="flex flex-row items-center gap-3">
                <span className="font-normal">
                  {field.value?.length ? field.value.length : null}
                </span>
                <ChevronRight size={20} />
              </span>
            </FormLabel>
          </FormItem>
        );
      }}
    />
  );
};

export const SelectMobileFilterContent = (props: { filter: FilterSchema; onBack: () => void }) => {
  const { filter, onBack } = props;
  const { control } = useFormContext();
  const options = useCatalogOptions()[filter.key];

  const [values, setValues] = useState<Array<string | number>>(
    control._formValues[filter.field] ?? []
  );

  return (
    <FormField
      control={control}
      name={filter.field}
      render={({ field }) => {
        const activeValuesMap = NArray.newBy(values ?? []).recordBy(
          (it) => it,
          () => true
        );

        const handleChange = (value: string | number) => {
          setValues(
            activeValuesMap[value] ? values.filter((v) => v !== value) : [...values, value]
          );
        };

        const handleSubmit = () => {
          field.onChange(values);
          onBack();
        };

        const handleClear = () => {
          setValues([]);
        };

        return (
          <FormItem className="flex flex-col gap-2">
            <div className={cn('mx-auto flex w-full flex-col gap-2 overflow-y-scroll p-4 pt-0')}>
              <FormControl>
                <div className="flex flex-col gap-2 px-2">
                  {options.map((it) => (
                    <Button
                      key={it.id}
                      size="lg"
                      variant={activeValuesMap[it.id] ? 'flat' : 'flat'}
                      color={activeValuesMap[it.id] ? 'primary' : 'default'}
                      className="justify-start pl-3"
                      startIcon={
                        activeValuesMap[it.id] ? (
                          <Check className="h-8 w-8" />
                        ) : (
                          <span className="size-8" />
                        )
                      }
                      onClick={() => {
                        handleChange(it.id);
                      }}
                    >
                      {it.name}
                    </Button>
                  ))}
                  <div className="fixed right-4 bottom-4 left-4 flex flex-row gap-2">
                    <Button variant="flat" className="w-full" onClick={handleClear}>
                      Очистить
                    </Button>
                    <Button className="w-full" onClick={handleSubmit}>
                      Применить
                    </Button>
                  </div>
                </div>
              </FormControl>
            </div>
          </FormItem>
        );
      }}
    />
  );
};
