import React, { lazy } from 'react';
import { useFormContext } from 'react-hook-form';

import { Switch } from '@re/ui-kit/ui/switch';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import {
  PublisherWallpaper,
  PublisherWallpaperBackground,
  PublisherWallpaperRoot,
} from '~entities/publisher/ui/publisher-wallpaper';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~shared/ui/form';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { Section, SectionContent } from '~shared/ui/section';

import type { clubCreateUpdate } from '../../../gen';

const ToolbarBold = lazy(() =>
  import(/* webpackChunkName: "ToolbarBold" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarBold,
  }))
);

const ToolbarItalic = lazy(() =>
  import(/* webpackChunkName: "ToolbarItalic" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarItalic,
  }))
);

const ToolbarRoot = lazy(() =>
  import(/* webpackChunkName: "ToolbarRoot" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarRoot,
  }))
);

const ToolbarStrikethrough = lazy(() =>
  import(/* webpackChunkName: "ToolbarStrikethrough" */ '~shared/ui/text-editor/toolbar').then(
    (m) => ({ default: m.ToolbarStrikethrough })
  )
);

const TextEditorEditableArea = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorEditableArea" */ '~shared/ui/text-editor/text-editor'
  ).then((m) => ({ default: m.TextEditorEditableArea }))
);

const TextEditorRoot = lazy(() =>
  import(/* webpackChunkName: "TextEditorRoot" */ '~shared/ui/text-editor/text-editor').then(
    (m) => ({ default: m.TextEditorRoot })
  )
);
const TextEditorContainer = lazy(() =>
  import(/* webpackChunkName: "TextEditorContainer" */ '~shared/ui/text-editor/text-editor').then(
    (m) => ({ default: m.TextEditorContainer })
  )
);

const TextEditorMarkdownPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorMarkdownPlugin" */ '~shared/ui/text-editor/plugins/markdown-plugin'
  ).then((m) => ({
    default: m.TextEditorMarkdownPlugin,
  }))
);

const TextEditorOnChangePlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorOnChangePlugin" */ '~shared/ui/text-editor/plugins/on-change-plugin'
  ).then((m) => ({
    default: m.TextEditorOnChangePlugin,
  }))
);

const TextEditorAutoFocusPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorAutoFocusPlugin" */ '~shared/ui/text-editor/plugins/auto-focus-plugin'
  ).then((m) => ({
    default: m.TextEditorAutoFocusPlugin,
  }))
);

const TextEditorDefaultValuePlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorDefaultValuePlugin" */ '~shared/ui/text-editor/plugins/default-value-plugin'
  ).then((m) => ({
    default: m.TextEditorDefaultValuePlugin,
  }))
);

export const ClubItemForm = () => {
  'use no memo';
  const {
    control,
    formState: { dirtyFields, defaultValues, errors },
  } = useFormContext<clubCreateUpdate>();

  return (
    <div className={cn('flex flex-col items-center gap-8 border-none max-sm:p-0')}>
      <FormField
        name="wallpaper"
        control={control}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="">Обои гильдии</FormLabel>

            <FormControl>
              <ImageUploadEditorRoot
                canCrop={(file) => !!(file && file.type !== 'image/gif')}
                value={field.value}
                onValueChange={(v) => {
                  if (!v) field.onChange('');
                  else field.onChange(v);
                }}
              >
                <ImageUploadEditorTrigger className="w-full overflow-hidden rounded-md">
                  {({ src }) => (
                    <PublisherWallpaperRoot className="h-auto">
                      <PublisherWallpaperBackground className="bg-accent border-border relative aspect-video overflow-hidden rounded-sm border">
                        {src && !src.startsWith('/media/no') ? (
                          <PublisherWallpaper src={src} withMask={false} />
                        ) : (
                          <div className="border-border bg-muted/10 flex size-20 items-center justify-center border"></div>
                        )}
                      </PublisherWallpaperBackground>
                    </PublisherWallpaperRoot>
                  )}
                </ImageUploadEditorTrigger>
                <ImageUploadEditorContent>
                  <ImageUploadEditorUploader
                    opts={{
                      accept: 'image/*',
                      maxSize: 5 * 1024 * 1024,
                    }}
                  />
                  <ImageUploadEditorCropper aspect={16 / 9}>
                    {({ src, ref, onLoad }) => (
                      <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
                    )}
                  </ImageUploadEditorCropper>
                </ImageUploadEditorContent>
              </ImageUploadEditorRoot>
            </FormControl>
          </FormItem>
        )}
      />

      <div className="z-10 -mt-18 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:px-8">
        <FormField
          name="avatar"
          control={control}
          render={({ field }) => (
            <FormItem className="self-center sm:self-start">
              {/*<FormLabel>Аватар гильдии</FormLabel>*/}
              <FormControl>
                <Section className="p-0">
                  <SectionContent>
                    <ImageUploadEditorRoot
                      canCrop={(file) => !!(file && file.type !== 'image/gif')}
                      value={field.value}
                      onValueChange={(v) => {
                        if (!v) field.onChange('');
                        else field.onChange(v);
                      }}
                    >
                      <ImageUploadEditorTrigger>
                        {({ src }) => (
                          <PublisherAvatar imgSrc={src} alt="Аватар команды" size={192} />
                        )}
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
                  </SectionContent>
                </Section>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full flex-col gap-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => {
          const val = !field?.value ? '' : field.value.replace(/(<([^>]+)>)/gi, '').trimEnd();
          return (
            <FormItem className="w-full">
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <TextEditorRoot innerClassName="bg-transparent border border-border">
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
                    <div className="flex-1" />

                    <ReText
                      align="center"
                      className="flex h-[30px] items-center"
                      size="xs"
                      color="muted-foreground"
                    >
                      {val.length}/500
                    </ReText>
                  </ToolbarRoot>
                </TextEditorRoot>
              </FormControl>
              <FormDescription className="mt-1 p-1">
                Ссылки на сторонние источники запрещены.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name="is_public"
        defaultValue
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2 self-start">
            <span className="flex items-center justify-center gap-2 self-start">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="ml-4 flex flex-col">
                <FormLabel className="!mb-0">Публичная</FormLabel>
                <FormDescription>
                  В публичную гильдию могут вступать все, в приватную - только по приглашению
                </FormDescription>
              </div>
            </span>
          </FormItem>
        )}
      />
    </div>
  );
};
