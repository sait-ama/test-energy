'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

import pick from 'lodash.pick';

import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';

import { usePublisherUpdate } from '~entities/publisher/model/mutations';
import { usePublisherQuery } from '~entities/publisher/model/queries';
import { PublisherQueryKey } from '~entities/publisher/model/query-keys';
import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import {
  PublisherWallpaper,
  PublisherWallpaperBackground,
  PublisherWallpaperRoot,
} from '~entities/publisher/ui/publisher-wallpaper';
import type { CommonSettingsPublisherValidatorSchema } from '~features/(publisher)/forms/profile/model/validator';
import { CommonSettingsPublisherValidator } from '~features/(publisher)/forms/profile/model/validator';
import type { PublisherResponseSchema } from '~shared/api/models/publisher';
import { getQueryClient } from '~shared/api/react-query';
import Title from '~shared/assets/placeholders/title';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond } from '~shared/lib/form/can-save-cond';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '~shared/ui/form';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

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
  {
    ssr: false,
  }
);
const TextEditorContainer = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorContainer,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[6/1]" />,
  }
);
const TextEditorEditableArea = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorEditableArea,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[6/1]" />,
  }
);
const TextEditorRoot = dynamic(
  () =>
    import('~shared/ui/text-editor/text-editor').then((m) => ({
      default: m.TextEditorRoot,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-[6/1]" />,
  }
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
export const PublisherProfileForm = () => {
  const { dir } = useParams<{ dir: string }>();

  const { data: { content } = {} } = usePublisherQuery(
    { variables: { params: { dir } } },
    { enabled: !!dir }
  );

  const form = useForm({
    schema: CommonSettingsPublisherValidator,
    defaultValues: {
      tagline: content?.tagline,
      name: content?.name,
      description: content?.description,
      cover: content?.cover.high || '',
      wallpaper: content?.wallpaper.high || '',
    },
  });
  const { control, handleSubmit } = form;
  const haveUnsavedChanges = canSaveCond(form);
  const { mutateAsync, isPending } = usePublisherUpdate();
  const resolveErrors = useErrorHandler({ form });
  useBeforeUnloadAlert(!haveUnsavedChanges);

  const onSubmit = async (data: CommonSettingsPublisherValidatorSchema) => {
    try {
      const validated = pick(data, Object.keys(form.formState.dirtyFields));
      await mutateAsync(
        { params: { dir: content.dir }, data: validated },
        {
          onSuccess: ({ content }) => {
            //todo Would you mind doing like me?!
            getQueryClient().setQueryData<PublisherResponseSchema>(
              PublisherQueryKey.getPublisherByDir({ params: { dir } }),
              (dara) => (!dara ? dara : { ...dara, content: { ...dara.content, ...content } })
            );
          },
        }
      );
      const toast = await importToastAsync();
      toast.success('Настройки успешно применены');
    } catch (e) {
      await resolveErrors(e);
      logger.error(e);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, console.log)} className="space-y-4">
        <FormField
          name="wallpaper"
          control={form.control}
          render={({ field }) => (
            <ImageUploadEditorRoot
              canCrop={(file) => !!(file && file.type !== 'image/gif')}
              value={field.value!}
              onValueChange={field.onChange}
            >
              <ImageUploadEditorTrigger className="w-full">
                {({ src }) => (
                  <PublisherWallpaperRoot className="h-auto">
                    <PublisherWallpaperBackground className="border-border relative aspect-video overflow-hidden rounded-sm border">
                      {src && !src.startsWith('/media/no') ? (
                        <PublisherWallpaper src={src} withMask={false} />
                      ) : (
                        <div className="border-border bg-muted/10 flex size-full items-center justify-center border">
                          <Title size={192} />
                        </div>
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
          )}
        />
        <FormField
          name="cover"
          control={form.control}
          render={({ field }) => (
            <ImageUploadEditorRoot
              canCrop={(file) => !!(file && file.type !== 'image/gif')}
              value={field.value!}
              onValueChange={field.onChange}
            >
              <ImageUploadEditorTrigger>
                {({ src }) => <PublisherAvatar imgSrc={src} alt="Аватар команды" size={192} />}
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
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Состоит из букв, цифр и символов @/./+/-/_. За недопустимый по правилам ник Вы
                можете получить бан.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Подпись</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {/*<FormDescription>Состоит из букв, цифр и символов @/./+/-/_. За недопустимый по правилам ник Вы можете получить бан.</FormDescription>*/}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>О себе</FormLabel>
              <FormControl>
                <TextEditorRoot>
                  <TextEditorContainer>
                    <Suspense fallback={<Skeleton className="aspect-[6/1]" />}>
                      <TextEditorEditableArea />
                    </Suspense>
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
              <FormDescription>Ссылки на сторонние источники запрещены.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button loading={isPending} type="submit" disabled={!haveUnsavedChanges}>
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
};
