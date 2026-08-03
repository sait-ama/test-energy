import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { ButtonGroup } from '@re/ui-kit/ui/button-group';
import { RadioGroup, RadioGroupButtonItem } from '@re/ui-kit/ui/radio-group';

import { BACK_ACTION_STRATEGY } from '~entities/reader/model/const';
import type { ReaderSettingsSchema } from '~entities/reader/model/validators';
import { FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';

export const ReaderRestSettings = () => {
  const form = useFormContext<ReaderSettingsSchema>();

  return (
    <FormField
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Возвращать по кнопке назад</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex w-full gap-2 rounded-sm"
            >
              <ButtonGroup className="w-full">
                <RadioGroupButtonItem value={BACK_ACTION_STRATEGY.TITLE}>
                  К тайтлу
                </RadioGroupButtonItem>
                <RadioGroupButtonItem value={BACK_ACTION_STRATEGY.PREVIOUS_CHAPTER}>
                  К предыдущей главе
                </RadioGroupButtonItem>
              </ButtonGroup>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
      name="common.backActionStrategyId"
    />
  );
};
