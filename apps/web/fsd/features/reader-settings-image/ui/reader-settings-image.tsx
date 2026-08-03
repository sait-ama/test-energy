import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { ButtonGroup } from '@re/ui-kit/ui/button-group';
import { RadioGroup, RadioGroupButtonItem } from '@re/ui-kit/ui/radio-group';
import { Slider } from '@re/ui-kit/ui/slider';

import type { ReaderSettingsSchema } from '~entities/reader/model/validators';
import { ContentTypes } from '~shared/config/constants';
import { ContentTypeExclusive } from '~shared/lib/domain/content-exclusive';
import { FormControl, FormField, FormItem, FormLabel } from '~shared/ui/form';

export const ReaderSettingsImage = () => {
  const form = useFormContext<ReaderSettingsSchema>();

  return (
    <>
      <FormField
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Яркость</span>
              <span>{field.value}%</span>
            </FormLabel>
            <FormControl>
              <Slider
                step={2}
                max={100}
                min={20}
                value={[field.value]}
                onValueChange={([value]) => {
                  field.onChange(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
        name="common.brightness"
      />

      <ContentTypeExclusive only={ContentTypes.MANGA}>
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Вмещать изображение</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex w-full gap-2 rounded-sm"
                >
                  <ButtonGroup className="w-full">
                    <RadioGroupButtonItem value="width">По ширине</RadioGroupButtonItem>
                    <RadioGroupButtonItem value="height">По высоте</RadioGroupButtonItem>
                  </ButtonGroup>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
          name="manga.imageFit"
        />

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Увеличение изображений</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex w-full gap-2 rounded-sm"
                >
                  <ButtonGroup className="w-full">
                    <RadioGroupButtonItem value>Увеличивать</RadioGroupButtonItem>
                    <RadioGroupButtonItem value={false}>Не увеличивать</RadioGroupButtonItem>
                  </ButtonGroup>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
          name="manga.zoom"
        />

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Зона нажатия</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex w-full gap-2 rounded-sm"
                >
                  <ButtonGroup className="w-full">
                    <RadioGroupButtonItem value="page">Страница</RadioGroupButtonItem>
                    <RadioGroupButtonItem value="full">Весь экран</RadioGroupButtonItem>
                  </ButtonGroup>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
          name="manga.clickableAreaZone"
        />

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Отступ между картинками</span>
                <span>{field.value}px</span>
              </FormLabel>
              <FormControl>
                <Slider
                  step={2}
                  max={48}
                  min={0}
                  value={[field.value]}
                  onValueChange={([value]) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
          name="manga.gapBetweenItems"
        />
      </ContentTypeExclusive>
    </>
  );
};
