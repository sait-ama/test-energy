'use client';
import React, { Suspense } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { closestCorners } from '@dnd-kit/core';
import SortableHandleIcon from '@re/ui-kit/icons/menu';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import type { z } from 'zod';

import { HorizontalSimpleTitleCard } from '~entities/title/ui/horizontal-simple-title-card';
import type { CollectionValidator } from '~features/(collections)/model/validators';
import { TitleSchema } from '~shared/api/models/common';
import type { SearchField, SearchItem } from '~shared/api/models/search';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { Sortable, SortableDragHandle, SortableItem } from '~shared/ui/sortable/sortable';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { preventDefault } from '~shared/utils/prevent-default';

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

export const CollectionItems = ({ type }: { type: SearchField }) => {
  'use no memo';
  const { control, setValue, getValues } = useFormContext<z.infer<typeof CollectionValidator>>();
  const openSearchModal = useSearchModal((v) => v.open);
  const t = useTranslations('pages.collections.actions.form-fields');

  const handleAdd = (title: SearchItem<SearchField.titles>) => {
    const currentValue = (getValues('titles') || []) as unknown as TitleSchema[];
    if (currentValue.find((c) => c.id === title.id)) return;

    setValue(
      'titles',
      [
        ...currentValue,
        {
          title: title.id,
          pos: currentValue.length,
          ...title,
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleDelete = (index: number) => {
    const currentValue = [...(getValues('titles') || [])];
    currentValue.splice(index, 1);

    setValue('titles', currentValue, { shouldDirty: true });
  };

  const titles = useWatch({ name: 'titles', control }) || [];
  return (
    <div className="flex flex-col gap-4">
      {/*<CoverField titles={titles} />*/}

      <Section>
        <SectionContent className="flex flex-col gap-2">
          <FormField
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name.label')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="name"
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description.label')}</FormLabel>
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
                <FormDescription>{t('description.description')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionContent>
      </Section>

      <Section>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <SectionTitle>{t('titles.label')}</SectionTitle>

          <Button
            size="lg"
            variant="outline"
            className="justify-start"
            onClick={() => {
              openSearchModal({
                asDiv: true,
                hits: false,
                history: false,
                fields: [type],
                // @ts-ignore
                onClick: handleAdd,
              });
            }}
          >
            {t('titles.trigger')}
          </Button>
        </div>
        <FormField
          control={control}
          render={({ field }) => {
            const titles = field.value || [];
            return (
              <SectionContent className="w-full flex-col gap-2">
                <FormItem>
                  <FormMessage />
                  <FormControl>
                    <div className="gap-2flex flex-col">
                      <Sortable
                        orientation="vertical"
                        collisionDetection={closestCorners}
                        // overlay={<div className="z-100 size-full rounded-md bg-primary/10" />}
                        value={titles.map((v) => ({ ...v, id: v.id || v.title }))}
                        enableSensorClick={false}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        {titles?.map((value, index) => (
                          <SortableItem
                            value={value.title}
                            key={value.id}
                            className="mb-4 flex items-center gap-2"
                          >
                            <SortableDragHandle asChild>
                              <div className="p-xs">
                                <SortableHandleIcon size={14} />
                              </div>
                            </SortableDragHandle>
                            <HorizontalSimpleTitleCard
                              className="p-4"
                              /*@ts-ignore*/
                              model={value}
                              actions={
                                <div className="gap-sm flex items-center self-stretch">
                                  <Button
                                    variant="destructive"
                                    circle
                                    onClick={mergeFunc(preventDefault, () => {
                                      handleDelete(index);
                                    })}
                                  >
                                    <Trash className="text-destructive-foreground" size={20} />
                                  </Button>
                                </div>
                              }
                            />
                          </SortableItem>
                        ))}
                      </Sortable>
                    </div>
                  </FormControl>
                </FormItem>
              </SectionContent>
            );
          }}
          name="titles"
        />
      </Section>
    </div>
  );
};
