import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Slider } from '@re/ui-kit/ui/slider';

import { FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';

export const ReaderSettingsScroll = () => {
  const form = useFormContext();
  const scrollToTap = useWatch({ name: 'common.tapToScroll', control: form.control });

  return (
    <>
      {/*<FormField*/}
      {/*    control={form.control}*/}
      {/*    render={({ field }) => (*/}
      {/*        <FormItem className="flex items-center gap-2">*/}
      {/*            <FormControl>*/}
      {/*                <Switch checked={field.value} onCheckedChange={field.onChange} />*/}
      {/*            </FormControl>*/}
      {/*            <FormLabel>Скролл по тапам</FormLabel>*/}
      {/*        </FormItem>*/}
      {/*    )}*/}
      {/*    name="common.tapToScroll"*/}
      {/*/>*/}
      {/*{scrollToTap ? (*/}
      {/*    <FormField*/}
      {/*        control={form.control}*/}
      {/*        render={({ field }) => (*/}
      {/*            <FormItem>*/}
      {/*                <FormLabel className="flex justify-between">*/}
      {/*                    <span>Размер скролла по тапу</span>*/}
      {/*                    <span>{field.value}% экрана</span>*/}
      {/*                </FormLabel>*/}
      {/*                <FormControl>*/}
      {/*                    <Slider step={5} max={150} min={50} value={[field.value]} onValueChange={([value]) => field.onChange(value)} />*/}
      {/*                </FormControl>*/}
      {/*            </FormItem>*/}
      {/*        )}*/}
      {/*        name="common.tapToScrollSize"*/}
      {/*    />*/}
      {/*) : null}*/}

      <FormField
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Скорость автоскролла</span>
              <span>{field.value < 2 ? 'Медленная' : field.value < 5 ? 'Средняя' : 'Высокая'}</span>
            </FormLabel>
            <FormControl>
              <Slider
                step={1}
                max={8}
                min={1}
                value={[field.value]}
                onValueChange={([value]) => {
                  field.onChange(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
        name="common.autoScrollSize"
      />
    </>
  );
};
