import { useEffect, useMemo } from 'react';
import * as React from 'react';

import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import { ReText } from '@re/ui-kit/ui/text';

import { useReaderSettings } from '~entities/reader/model/store';
import { ReaderSettingsValidator } from '~entities/reader/model/validators';
import {
  ReaderMainSettings,
  SettingsView,
  useSettingViews,
} from '~features/reader-main-settings/ui/reader-main-settings';
import { ReaderRestSettings } from '~features/reader-rest-settings/ui/reader-rest-settings';
import { ReaderSettingsHotkeys } from '~features/reader-settings-hotkeys/ui/reader-settings-hotkeys';
import { ReaderSettingsImage } from '~features/reader-settings-image/ui/reader-settings-image';
import { ReaderSettingsScroll } from '~features/reader-settings-scroll/ui/reader-settings-scroll';
import { Form, useForm } from '~shared/ui/form';
import { Transition } from '~shared/ui/transition_unstable';

export const AsideSettingsHeader = () => {
  const { value, setValue } = useSettingViews();

  const content = useMemo(() => {
    let text = '';

    switch (value) {
      case SettingsView.HOTKEYS:
        text = 'Настройки горячих клавиш';
        break;
      case SettingsView.IMAGE:
        text = 'Настройки изображений';
        break;
      case SettingsView.SCROLL:
        text = 'Настройки скролла';
        break;
      case SettingsView.REST:
        text = 'Другие настройки';
        break;
      default:
        text = 'Настройки читалки';
    }

    if (value === SettingsView.DEFAULT) {
      return (
        <ReText size="lg" weight="semibold">
          Настройки читалки
        </ReText>
      );
    }

    return (
      <ReText
        size="lg"
        weight="semibold"
        onClick={() => {
          setValue(SettingsView.DEFAULT);
        }}
        className="hover:text-primary flex cursor-pointer items-center gap-1 underline-offset-4 hover:underline"
      >
        <ChevronLeft /> {text}
      </ReText>
    );
  }, [value]);

  return (
    <Transition name="fade" slideClassName="flex items-center">
      {content}
    </Transition>
  );
};

export const AsideSettingsContent = () => {
  'use no memo';

  const settings = useReaderSettings((v) => v.value);
  const setSettings = useReaderSettings((v) => v.onValueChange);

  const form = useForm({
    schema: ReaderSettingsValidator,
    defaultValues: settings,
  });

  const { value } = useSettingViews();

  useEffect(() => {
    const subscription = form.watch((values) => {
      // @ts-ignore
      setSettings(values);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form]);

  const content = useMemo(() => {
    switch (value) {
      case SettingsView.HOTKEYS:
        return <ReaderSettingsHotkeys />;
      case SettingsView.IMAGE:
        return <ReaderSettingsImage />;
      case SettingsView.SCROLL:
        return <ReaderSettingsScroll />;
      case SettingsView.REST:
        return <ReaderRestSettings />;
      default:
        return <ReaderMainSettings />;
    }
  }, [value]);

  return (
    <Form {...form}>
      <Transition
        name="slide"
        direction={value === SettingsView.DEFAULT ? -1 : 1}
        slideClassName="flex flex-col gap-4 p-2"
      >
        {content}
      </Transition>
    </Form>
  );
};
