import React from 'react';
import { useFormContext } from 'react-hook-form';
import dynamic from 'next/dynamic';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';

import { useCreatorForms } from '~entities/creator/model/queries';
import { CreatorAvatar } from '~entities/creator/ui/creator-avatar';
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

export const CreatorForm = () => {
  const form = useFormContext();

  const { data: list } = useCreatorForms();

  return (
    <>
      <Section className="flex flex-col items-center gap-3 border-none sm:flex-row sm:items-end">
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
                  {({ src }) => <CreatorAvatar src={src} alt="Character Avatar" size={192} />}
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
                      <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
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
              <FormItem className="sm:mx-0">
                <FormLabel>Имя/псевдоним</FormLabel>
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
              <FormItem className="sm:mx-0">
                <FormLabel>Альтернативное имя/название</FormLabel>
                <FormControl>
                  <Input {...field} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Section>
      <Section className="border-none">
        <FormField
          control={form.control}
          name="data.description"
          render={({ field }) => (
            <FormItem className="sm:mx-0">
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <TextEditorRoot>
                  <TextEditorContainer>
                    <TextEditorEditableArea />
                    <TextEditorMarkdownPlugin />
                    <TextEditorOnChangePlugin onChange={field.onChange} />
                    <TextEditorDefaultValuePlugin defaultValue={field.value} />
                    <TextEditorAutoFocusPlugin />
                  </TextEditorContainer>
                  <ToolbarRoot>
                    <ToolbarBold />
                    <ToolbarItalic />
                    <ToolbarStrikethrough />
                  </ToolbarRoot>
                </TextEditorRoot>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
      <Section className="flex flex-col gap-3 border-none sm:mx-0">
        <FormField
          control={form.control}
          name="data.type"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Тип</FormLabel>
              <FormControl>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(typeof v === 'string' ? Number(v) : v)}
                >
                  <SelectTrigger withIcon>
                    <SelectValue placeholder="Варианты..." />
                  </SelectTrigger>
                  <SelectContent>
                    {list.content.type.map((it) => (
                      <SelectItem key={it.id} value={String(it.id)}>
                        {it.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data.country"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Страна</FormLabel>
              <FormControl>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(typeof v === 'string' ? Number(v) : v)}
                >
                  <SelectTrigger withIcon>
                    <SelectValue placeholder="Варианты..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {list.content.country.map((it) => (
                        <SelectItem key={it.id} value={String(it.id)}>
                          {it.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Section>
      <Section className="border-none">
        <FormField
          control={form.control}
          name="user_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Сообщение модератору</FormLabel>
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
