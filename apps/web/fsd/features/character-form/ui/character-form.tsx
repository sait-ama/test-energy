'use client';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldPath, FieldValues, UseFormStateReturn } from 'react-hook-form/dist/types';
import { ControllerFieldState, ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { closestCorners } from '@dnd-kit/core';

import SortableHandleIcon from '@re/ui-kit/icons/menu';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';

import { CharacterImage } from '~entities/character/ui/character-image';
import { HorizontalSimpleTitleCard } from '~entities/title/ui/horizontal-simple-title-card';
import { SearchField as SearchFieldEnum } from '~shared/api/models/search';
import { TitleSchema } from '~shared/api/models/title';
import { SearchField } from '~shared/lib/search/search-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { Section } from '~shared/ui/section';
import { Sortable, SortableDragHandle, SortableItem } from '~shared/ui/sortable/sortable';
import { TextEditorSpoilerPlugin } from '~shared/ui/text-editor/text-editor';
import { ToolbarSpoiler } from '~shared/ui/text-editor/toolbar';

const ToolbarBold = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarBold,
    })),
  { ssr: false }
);
const ToolbarItalic = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarItalic,
    })),
  { ssr: false }
);
const ToolbarRoot = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarRoot,
    })),
  { ssr: false }
);
const ToolbarStrikethrough = dynamic(
  () =>
    import('~shared/ui/text-editor/toolbar').then((m) => ({
      default: m.ToolbarStrikethrough,
    })),
  { ssr: false }
);

const TextEditorContainer = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorContainer,
    })),
  { ssr: false }
);
const TextEditorEditableArea = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorEditableArea,
    })),
  { ssr: false }
);
const TextEditorRoot = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorRoot,
    })),
  { ssr: false }
);
const TextEditorMarkdownPlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/markdown-plugin').then((m) => ({
      default: m.TextEditorMarkdownPlugin,
    })),
  {
    ssr: false,
  }
);
const TextEditorOnChangePlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/on-change-plugin').then((m) => ({
      default: m.TextEditorOnChangePlugin,
    })),
  {
    ssr: false,
  }
);
const TextEditorDefaultValuePlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/default-value-plugin').then((m) => ({
      default: m.TextEditorDefaultValuePlugin,
    })),
  {
    ssr: false,
  }
);
const TextEditorAutoFocusPlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/auto-focus-plugin').then((m) => ({
      default: m.TextEditorAutoFocusPlugin,
    })),
  {
    ssr: false,
  }
);

const CharacterTitlesList = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  defaultValue,
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
  defaultValue?: Record<number, TitleSchema>;
}) => {
  const [values, setValues] = useState<Record<number, TitleSchema>>(defaultValue ?? {});

  return (
    <FormItem>
      <FormLabel>Тайтлы</FormLabel>
      <FormControl>
        <SearchField<number[], TitleSchema>
          onChange={(newValue) => {
            const isExists = field.value.includes(newValue.id);
            if (isExists) return;

            setValues((prev) => ({ ...prev, [newValue.id]: newValue }));
            field.onChange([...field.value, newValue.id]);
          }}
          value={field.value}
          opts={{
            fields: [SearchFieldEnum.titles],
          }}
        >
          {({ value, onAction }) => {
            return value.length > 0 ? (
              <div className="space-y-2">
                <Sortable
                  orientation="vertical"
                  collisionDetection={closestCorners}
                  value={field.value}
                  enableSensorClick={false}
                  onValueChange={(value) => {
                    field.onChange(value, { shouldDirty: true });
                  }}
                >
                  {value
                    .map((it) => values[it])
                    .map((item) => (
                      <SortableItem
                        value={item.id}
                        key={item.id}
                        className="flex items-center gap-2"
                      >
                        <SortableDragHandle asChild>
                          <div className="p-xs">
                            <SortableHandleIcon size={14} />
                          </div>
                        </SortableDragHandle>
                        <HorizontalSimpleTitleCard
                          className="p-4"
                          model={item}
                          actions={
                            <Button
                              variant="destructive"
                              circle
                              className="mr-4"
                              onClick={() => {
                                const filteredValues = field.value.filter((it) => it !== item.id);

                                field.onChange(filteredValues);
                              }}
                            >
                              <Trash className="text-destructive-foreground" size={20} />
                            </Button>
                          }
                        />
                      </SortableItem>
                    ))}
                </Sortable>

                <Button size="lg" variant="secondary" className="justify-end" onClick={onAction}>
                  Добавить ещё
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-start"
                onClick={onAction}
              >
                Выбрать
              </Button>
            );
          }}
        </SearchField>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

interface CharacterFormBaseProps {
  defaultValues?: {
    titles?: Record<number, TitleSchema>;
  };
}

export const CharacterFormBase = (props: CharacterFormBaseProps) => {
  const { defaultValues } = props;
  const form = useFormContext();
  const t = useTranslations('character.form.labels');
  const tImage = useTranslations('character.form.image');

  return (
    <>
      <Section className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center">
        <FormField
          name="data.cover"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <ImageUploadEditorRoot
                canCrop={(file) => !!(file && file.type !== 'image/gif')}
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <ImageUploadEditorTrigger>
                  {({ src }) => <CharacterImage imgSrc={src} alt={tImage('alt')} size={192} />}
                </ImageUploadEditorTrigger>
                <ImageUploadEditorContent>
                  <ImageUploadEditorUploader
                    opts={{
                      accept: 'image/*',
                      maxSize: 5 * 1024 * 1024,
                    }}
                  />
                  <ImageUploadEditorCropper aspect={1}>
                    {({ src, ref, onLoad }) => (
                      <img src={src} alt={tImage('alt')} ref={ref} onLoad={onLoad} />
                    )}
                  </ImageUploadEditorCropper>
                </ImageUploadEditorContent>
              </ImageUploadEditorRoot>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col justify-end gap-4">
          <FormField
            control={form.control}
            name="data.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('character_name')}</FormLabel>
                <FormControl>
                  <Input {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data.alt_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('alt_name')}</FormLabel>
                <FormControl>
                  <Input {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Section>

      <Section>
        <FormField
          control={form.control}
          name="data.titles"
          render={(field) => (
            <CharacterTitlesList {...field} defaultValue={defaultValues?.titles ?? {}} />
          )}
        />
      </Section>

      <Section>
        <FormField
          control={form.control}
          name="data.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <TextEditorRoot>
                  <TextEditorContainer>
                    <TextEditorEditableArea />
                    <TextEditorMarkdownPlugin />
                    <TextEditorOnChangePlugin onChange={field.onChange} />
                    <TextEditorDefaultValuePlugin defaultValue={field.value} />
                    <TextEditorAutoFocusPlugin />
                    <TextEditorSpoilerPlugin />
                  </TextEditorContainer>
                  <ToolbarRoot>
                    <ToolbarBold />
                    <ToolbarItalic />
                    <ToolbarStrikethrough />
                    <ToolbarSpoiler />
                  </ToolbarRoot>
                </TextEditorRoot>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
      <Section className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="data.details.power"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('power')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.details.sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('sex')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.details.classification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('classification')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.details.affiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('affiliation')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.details.age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('age')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.details.skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('skills')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>

      <Section>
        <FormField
          control={form.control}
          name="user_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mod_message')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
    </>
  );
};
