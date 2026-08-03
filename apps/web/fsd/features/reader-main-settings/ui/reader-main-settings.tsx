import * as React from 'react';
import { Fragment, ReactNode, Suspense } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import ChevronRight from '@re/ui-kit/icons/chevron-right';
import { Button } from '@re/ui-kit/ui/button';
import { ButtonGroup } from '@re/ui-kit/ui/button-group';
import { RadioGroup, RadioGroupButtonItem } from '@re/ui-kit/ui/radio-group';
import { Slider } from '@re/ui-kit/ui/slider';
import { Switch } from '@re/ui-kit/ui/switch';
import { create } from 'zustand';

import { useRequestState } from '~app/providers/request-state-provider';
import { IMAGE_SERVER } from '~entities/reader/model/const';
import type { ReaderSettingsSchema } from '~entities/reader/model/validators';
import { CISCountries, ConnectionCountry, ContentTypes } from '~shared/config/constants';
import { ContentTypeExclusive } from '~shared/lib/domain/content-exclusive';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '~shared/ui/form';
import { publicEnv } from '~shared/utils/env';

export enum SettingsView {
  DEFAULT,
  SCROLL,
  IMAGE,
  HOTKEYS,
  REST,
}

export const useSettingViews = create<{
  value: SettingsView;
  setValue: (value: SettingsView) => void;
}>((set) => ({
  value: SettingsView.DEFAULT,
  setValue: (value) => {
    set({ value });
  },
}));

const CisRenderer = ({ children }: { children?: (isSNG: boolean) => ReactNode }) => {
  const headers = useRequestState();
  const field = publicEnv('CONNECTING_IP_HEADER') as keyof typeof headers;
  const defaultCountry =
    process.env.NODE_ENV === 'production' ? undefined : ConnectionCountry.RUSSIA;
  const country = (headers?.[field] || defaultCountry) as unknown as ConnectionCountry | undefined;
  const isCIS = !!country && CISCountries.has(country);
  return <Fragment key={country || 'country'}>{children?.(isCIS)}</Fragment>;
};
export const ReaderMainSettings = () => {
  const form = useFormContext<ReaderSettingsSchema>();
  const readerType = useWatch({ control: form.control, name: 'manga.readerType' });
  const { setValue } = useSettingViews();

  return (
    <div className="flex h-full flex-col gap-6">
      <ContentTypeExclusive only={ContentTypes.MANGA}>
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип читалки</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex w-full flex-row gap-2"
                >
                  <ButtonGroup className="w-full">
                    <RadioGroupButtonItem value="pager">Постраничная</RadioGroupButtonItem>
                    <RadioGroupButtonItem value="slider">Лента</RadioGroupButtonItem>
                  </ButtonGroup>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
          name="manga.readerType"
        />
      </ContentTypeExclusive>

      <FormField
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between">
              <span>Ширина контейнера</span>
              <span>{field.value}%</span>
            </FormLabel>
            <Media lessThan={Display.md}>
              <FormControl>
                <Slider
                  step={2}
                  max={100}
                  min={10}
                  value={[field.value]}
                  onValueChange={([value]) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </Media>
            <Media greaterThanOrEqual={Display.md}>
              <FormControl>
                <Slider
                  step={2}
                  max={200}
                  min={10}
                  value={[field.value]}
                  onValueChange={([value]) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </Media>
          </FormItem>
        )}
        name="common.containerWidth"
      />

      <ContentTypeExclusive only={ContentTypes.NOVEL}>
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Размер шрифта</span>
                <span>{field.value} пикселей</span>
              </FormLabel>
              <FormControl>
                <Slider
                  step={2}
                  max={48}
                  min={10}
                  value={[field.value]}
                  onValueChange={([value]) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
          name="novel.fontSize"
        />

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Высота строк</span>
                <span>{field.value}</span>
              </FormLabel>
              <FormControl>
                <Slider
                  step={0.1}
                  max={3}
                  min={1}
                  value={[field.value]}
                  onValueChange={([value]) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
          name="novel.lineHeight"
        />
      </ContentTypeExclusive>

      <FormField
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="mb-1.5">Сервер картинок</FormLabel>
            <FormDescription className="mb-1.5text-xs">
              Рекомендуем менять сервер картинок, если на текущем картинки не грузятся или грузятся
              медленно
            </FormDescription>

            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="mt-4 flex w-full gap-2 rounded-sm"
              >
                <ButtonGroup className="w-full">
                  <Suspense
                    fallback={
                      <>
                        <RadioGroupButtonItem disabled value={IMAGE_SERVER.MAIN}>
                          Основной
                        </RadioGroupButtonItem>
                        <RadioGroupButtonItem disabled value={IMAGE_SERVER.RESERVED}>
                          Запасной
                        </RadioGroupButtonItem>
                      </>
                    }
                  >
                    <CisRenderer>
                      {(isSNG) => {
                        const disabled = isSNG;
                        const variant = disabled ? 'secondary' : 'outline';
                        return (
                          <>
                            <RadioGroupButtonItem
                              variant={variant}
                              className={
                                disabled ? 'data-[state=unchecked]:hover:bg-secondary' : ''
                              }
                              disabled={disabled}
                              value={IMAGE_SERVER.MAIN}
                            >
                              Основной
                            </RadioGroupButtonItem>
                            <RadioGroupButtonItem
                              variant={variant}
                              disabled={disabled}
                              className={
                                disabled
                                  ? 'data-[state=unchecked]:hover:bg-secondary cursor-normal'
                                  : ''
                              }
                              value={IMAGE_SERVER.RESERVED}
                            >
                              Запасной
                            </RadioGroupButtonItem>
                          </>
                        );
                      }}
                    </CisRenderer>
                  </Suspense>
                </ButtonGroup>
              </RadioGroup>
            </FormControl>
            <CisRenderer>
              {(isSNG) =>
                isSNG && (
                  <FormLabel className="text-accent-foreground/70 mb-1.5">
                    Смена сервера картинок недоступна в вашем регионе
                  </FormLabel>
                )
              }
            </CisRenderer>
          </FormItem>
        )}
        name="manga.imageServer"
      />

      <div className="flex flex-col gap-2">
        <Button
          className="justify-between"
          variant="flat"
          size="lg"
          onClick={() => {
            setValue(SettingsView.IMAGE);
          }}
        >
          Настройка изображения <ChevronRight />
        </Button>

        {!('ontouchstart' in document.documentElement) ? (
          <Button
            className="justify-between"
            variant="flat"
            size="lg"
            onClick={() => {
              setValue(SettingsView.HOTKEYS);
            }}
          >
            Настройка горячих клавиш <ChevronRight />
          </Button>
        ) : null}

        <Button
          className="justify-between"
          variant="flat"
          size="lg"
          onClick={() => {
            setValue(SettingsView.SCROLL);
          }}
        >
          Настройка скролла <ChevronRight />
        </Button>
        <Button
          className="justify-between"
          variant="flat"
          size="lg"
          onClick={() => {
            setValue(SettingsView.REST);
          }}
        >
          Другие настройки <ChevronRight />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {readerType === 'slider' ? (
          <FormField
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    defaultChecked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Автоподгрузка следующей главы</FormLabel>
              </FormItem>
            )}
            name="common.autoLoad"
          />
        ) : null}

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mb-0">Показывать заметки</FormLabel>
            </FormItem>
          )}
          name="manga.notes"
        />

        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mb-0">Отображение индикатора номера страницы</FormLabel>
            </FormItem>
          )}
          name="manga.pageIndicator"
        />
      </div>
    </div>
  );
};
