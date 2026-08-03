'use client';

import type { ReactNode } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { closestCorners } from '@dnd-kit/core';
import Add from '@re/ui-kit/icons/add';
import SortableHandleIcon from '@re/ui-kit/icons/menu';
import Trash from '@re/ui-kit/icons/trash';
import { Alert } from '@re/ui-kit/ui/alert';
import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { cn } from '@re/ui-kit/utils/cn';
import { useQuery } from '@tanstack/react-query';

import { HorizontalSimpleTitleCard } from '~entities/title/ui/horizontal-simple-title-card';
import { TitleImage } from '~entities/title/ui/title-image';
import type { Type } from '~shared/api/models/forms';
import { FormsTypes } from '~shared/api/models/forms';
import { SearchField as SearchFieldEnum } from '~shared/api/models/search';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { TitleRelations } from '~shared/api/models/title';
import Title from '~shared/assets/placeholders/title';
import { MultipleSearchField } from '~shared/lib/search/search-field';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSeparateMessage,
} from '~shared/ui/form';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';
import {
  ImageUploadEditorContent,
  ImageUploadEditorCropper,
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { Sortable, SortableDragHandle, SortableItem } from '~shared/ui/sortable/sortable';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { NArray } from '~shared/utils/NArray';
import { preventDefault } from '~shared/utils/prevent-default';

import { titleFormsTypes } from '../model/const';

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

interface TextFieldContainerProps {
  children: ReactNode;
  className?: string;
}

export const TextFieldContainer = (props: TextFieldContainerProps) => {
  const { children, className } = props;

  return <div className={cn('flex w-full gap-2', className)}>{children}</div>;
};

export const TitleFormAdditionalLinks = () => {
  const { control } = useFormContext();
  const { data } = useQuery(
    getTypesBaseKey({
      get: titleFormsTypes,
      type: FormsTypes.TITLES,
    })
  );

  const list = data?.content ?? {};

  const fieldName = `additional.links`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  const handleAddEmptyLink = () => {
    append({ value: '', type: '', isEmpty: true });
  };

  const handleRemoveLink = (id: number) => {
    remove(id);
    if (fields.length === 1) {
      handleAddEmptyLink();
    }
  };
  return (
    <Section className="py-2">
      <SectionTitle>Ссылки</SectionTitle>
      <SectionContent className="w-full flex-col gap-2">
        <Alert severity="info" className="mb-2">
          Если необходимого ресурса нет, напишите в тех. поддержку.
        </Alert>
        <FormSeparateMessage name={fieldName} />
        <div className="flex flex-col gap-2">
          {fields.map(({ id }, index) => (
            <div className="flex w-full flex-col gap-2 md:flex-row" key={id}>
              <FormField
                name={`${fieldName}.${index}.value`}
                control={control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} type="text" placeholder="Ссылка на ресурс" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-[1_0_auto] gap-2">
                <FormField
                  control={control}
                  name={`${fieldName}.${index}.type`}
                  render={({ field }) => (
                    <FormItem className="flex-[1_0_auto]">
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Ресурс" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              {list?.additional?.map(({ id, name }) => (
                                <SelectItem key={id} value={String(id)}>
                                  {name}
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

                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveLink(index);
                  }}
                  circle
                  disabled={index === 0 && fields.length === 1}
                >
                  <Trash className="text-destructive-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAddEmptyLink} startIcon={<Add />} size="sm">
            Добавить еще ссылку
          </Button>
        </div>
      </SectionContent>
    </Section>
  );
};

interface TitleFormPublishersProps {
  withType?: boolean;
  defaultValue?: {
    publishers?: Type[];
  };
}

const types = [
  { id: 'intercept', name: 'Перехват' },
  {
    id: 'add',
    name: 'Передача',
  },
  {
    id: 'reject',
    name: 'Отказ',
  },
  {
    id: 'collab',
    name: 'Совместка',
  },
];

export const TitleFormPublishers = (props: TitleFormPublishersProps) => {
  const { withType = true, defaultValue = {} } = props;

  const { control, setValue } = useFormContext();
  const branches = useWatch({ control, name: 'title.branches' }) ?? [];

  return (
    <Section className="px-4">
      <SectionTitle>Паблишеры</SectionTitle>
      <Tabs>
        <TabsList className={cn({ hidden: branches.length <= 1 })}>
          {branches?.map((it) => (
            <TabsTrigger
              key={it.id}
              value={it.id}
              onClick={() => {
                setValue('publishers.branch_id', it.id, { shouldDirty: true });
                setValue(
                  'publishers.publishers',
                  it.publishers.map((it) => it.id, { shouldDirty: true })
                );
              }}
            >
              {it.publishers.map((it) => it.name).join(' & ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-2 flex gap-2">
          <FormField
            control={control}
            name="publishers.publishers"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <MultipleSearchField
                    placeholder="Выбрать паблишера"
                    defaultValue={defaultValue.publishers}
                    onChange={(v) => {
                      field.onChange(Array.isArray(v) ? v.map(Number) : v);
                    }}
                    opts={{
                      fields: [SearchFieldEnum.publishers],
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {withType ? (
            <FormField
              control={control}
              name="publishers.type"
              render={({ field }) => (
                <FormItem className="w-1/4">
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Тип действия" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {types.map((it) => (
                            <SelectItem value={it.id} key={it.id}>
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
          ) : null}
        </div>
        {withType ? (
          <FormField
            control={control}
            name="publishers.user_message"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Сообщение модератору</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </Tabs>
    </Section>
  );
};

export const TitleFormRelations = () => {
  const form = useFormContext();
  const { open: openSearchModal } = useSearchModal();
  const { data } = useQuery(
    getTypesBaseKey({
      get: titleFormsTypes,
      type: FormsTypes.TITLES,
    })
  );
  const titleRelationsTypes = data?.content?.relations;

  const handleAdd = (title: TitleSchemaFragment) => {
    const currentValue = form.getValues('related.titles');
    form.setValue(
      'related.titles',
      [
        ...currentValue,
        {
          type: TitleRelations.SEQUEL,
          title,
          id: title.id,
        },
      ],
      { shouldDirty: true }
    );
  };

  const handleDelete = (index: number) => {
    const currentValue = [...form.getValues('related.titles')];
    currentValue.splice(index, 1);

    form.setValue('related.titles', currentValue, { shouldDirty: true });
  };

  const related = useWatch({ name: 'related.titles' });

  return (
    <Section>
      <SectionTitle>Связанные произведения</SectionTitle>
      <SectionContent className="w-full flex-col gap-2">
        <Alert severity="info" className="mb-2">
          Список связанных произведений общий для всех произведений из списка. При первом создании
          обязательно добавить текущее произведение, иначе необходимо добавить произведение в нужный
          список через другое произведение.
        </Alert>
        <div className="flex flex-col gap-2">
          <FormLabel>Тайтл</FormLabel>

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              //@ts-ignore
              openSearchModal({
                hits: false,
                history: false,
                fields: [SearchFieldEnum.titles],
                onClick: handleAdd,
              });
            }}
          >
            Выбрать
          </Button>
          <FormSeparateMessage name="__error.relations" />
        </div>
        <div className="flex flex-col gap-2">
          <Sortable
            orientation="vertical"
            collisionDetection={closestCorners}
            // overlay={<div className="z-100 size-full rounded-md bg-primary/10" />}
            value={related}
            enableSensorClick={false}
            onValueChange={(value) => {
              //@ts-ignore
              form.setValue('related.titles', value, { shouldDirty: true });
            }}
          >
            {related?.map((value, index) => (
              <SortableItem value={value.id} key={value.id} className="flex items-center gap-2">
                <SortableDragHandle asChild>
                  <div className="p-2">
                    <SortableHandleIcon size={14} />
                  </div>
                </SortableDragHandle>
                <HorizontalSimpleTitleCard
                  className="p-4"
                  model={value.title}
                  actions={
                    <div className="flex items-center gap-3 self-stretch">
                      <Select
                        value={value.type}
                        onValueChange={(value) => {
                          form.setValue(`related.titles.${index}.type`, value, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Тип действия" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {titleRelationsTypes.map((it) => (
                              <SelectItem value={it.id} key={it.id}>
                                {it.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
      </SectionContent>
    </Section>
  );
};

export interface TitleFormCreatorsProps {
  defaultValue?: {
    creators?: Type[];
  };
}

export const TitleFormCreators = (props: TitleFormCreatorsProps) => {
  const { defaultValue = {} } = props;

  const { control, setValue } = useFormContext();

  return (
    <Section>
      <SectionTitle>Создатели</SectionTitle>

      <FormField
        control={control}
        name="creators.creators"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <MultipleSearchField
                placeholder="Выбрать создателя"
                defaultValue={defaultValue.creators}
                onChange={(v) => {
                  field.onChange(Array.isArray(v) ? v.map(Number) : v);
                }}
                opts={{
                  fields: [SearchFieldEnum.creators],
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="creators.user_message"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Сообщение модератору</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Section>
  );
};

export interface ForbiddenFieldsProps {
  className?: string;
}

export const ForbiddenFields = (props: ForbiddenFieldsProps) => {
  const { className } = props;
  const { control } = useFormContext();
  const { data: { content: list } = {} } = useQuery(
    getTypesBaseKey({
      get: titleFormsTypes,
      type: FormsTypes.TITLES,
    })
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="secondary" className={className}>
          Блокировка полей
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col gap-4 p-4">
          <DialogHeader>
            <DialogTitle>Блокировка полей</DialogTitle>
            <DialogDescription>
              Только переводчики произведения смогут изменять заблокированные поля
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {(list?.forbidden_fields ?? []).map((it) => (
              <FormField
                key={it.id}
                control={control}
                name="title.forbidden_fields"
                render={({ field }) => (
                  <FormItem key={it.id} className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(String(it.id))}
                        onCheckedChange={(checked) => {
                          checked
                            ? field.onChange([...(field.value ?? []), it.id])
                            : field.onChange(field.value?.filter((value) => value !== it.id) ?? []);
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      className={cn(
                        'cursor-pointer font-normal',
                        !field.value?.includes(it.id) && 'text-muted-foreground'
                      )}
                    >
                      {it.name}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TitleFormProps {
  children?: ReactNode;
}

export const TitleFormBase = (props: TitleFormProps) => {
  const { children } = props;
  const { control } = useFormContext();
  const { data } = useQuery(
    getTypesBaseKey({
      get: titleFormsTypes,
      type: FormsTypes.TITLES,
    })
  );

  const list = data?.content!;

  return (
    <>
      <FormField
        name="title.wallpaper"
        control={control}
        render={({ field }) => (
          <FormItem autoFocus={false}>
            <ImageUploadEditorRoot
              canCrop={(file) => !!(file && file.type !== 'image/gif')}
              value={field.value! || ''}
              onValueChange={field.onChange}
            >
              <ImageUploadEditorTrigger className="border-border h-[240px] w-full overflow-hidden rounded-md border md:h-[320px]">
                {({ src }) => (
                  <ImageRoot className="size-full" src={src}>
                    <ImageContent alt="wallpaper" fill className="size-full object-cover" />
                    <ImageFallback>
                      <Title size={36} className="text-muted-foreground" />
                    </ImageFallback>
                  </ImageRoot>
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
            <FormMessage />
          </FormItem>
        )}
      />

      <Section>
        <SectionContent className="flex w-full flex-col items-center gap-4 sm:flex-row">
          <FormField
            name="title.cover"
            control={control}
            render={({ field }) => (
              <FormItem autoFocus={false}>
                <ImageUploadEditorRoot
                  canCrop={(file) => !!(file && file.type !== 'image/gif')}
                  value={field.value! || ''}
                  onValueChange={field.onChange}
                >
                  <ImageUploadEditorTrigger>
                    {({ src }) => <TitleImage src={src} alt="Обложка произведения" size={320} />}
                  </ImageUploadEditorTrigger>
                  <ImageUploadEditorContent>
                    <ImageUploadEditorUploader
                      opts={{
                        accept: 'image/*',
                        maxSize: 5 * 1024 * 1024,
                      }}
                    />
                    <ImageUploadEditorCropper aspect={2 / 3}>
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

          <TextFieldContainer className="flex-col">
            <FormField
              control={control}
              name="title.main_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Название на русском</FormLabel>
                  <FormControl>
                    <Input type="text" onChange={field.onChange} defaultValue={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="title.secondary_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Название на английском</FormLabel>
                  <FormControl>
                    <Input type="text" onChange={field.onChange} defaultValue={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="title.another_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Дополнительные названия</FormLabel>
                  <Alert severity="info" className="mb-2">
                    Указывайте каждое название с помощью разделителя &#34;/&#34; через пробел
                  </Alert>

                  <FormControl>
                    <Input type="text" onChange={field.onChange} defaultValue={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TextFieldContainer>
        </SectionContent>
      </Section>
      <Section>
        {/*<SectionTitle>Описание</SectionTitle>*/}
        <SectionContent>
          <FormField
            control={control}
            name="title.description"
            render={({ field }) => (
              <FormItem autoFocus={false} className="w-full">
                <FormControl>
                  <TextEditorRoot>
                    <TextEditorContainer>
                      <TextEditorEditableArea autoFocus={false} />
                      <TextEditorMarkdownPlugin />
                      <TextEditorOnChangePlugin onChange={field.onChange} />
                      <TextEditorDefaultValuePlugin defaultValue={field.value} />
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
        </SectionContent>
      </Section>

      <Section>
        <SectionContent className="flex flex-col gap-2">
          <TextFieldContainer className="flex-col md:flex-row">
            <FormField
              control={control}
              name="title.type"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col justify-end">
                  <FormLabel>Тип</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => {
                        field.onChange(typeof v === 'string' ? Number(v) : v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {list?.types.map((it) => (
                            <SelectItem value={String(it.id)} key={it.id}>
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
            <FormField
              control={control}
              name="title.age_limit"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col justify-end">
                  <FormLabel>Возрастное ограничение</FormLabel>
                  <FormControl className="self-end">
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => {
                        field.onChange(typeof v === 'string' ? Number(v) : v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {list?.age_limit.map((it) => (
                            <SelectItem value={String(it.id)} key={it.id}>
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
            <FormField
              control={control}
              name="title.issue_year"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col justify-end">
                  <FormLabel>Год выпуска</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TextFieldContainer>

          <TextFieldContainer className="flex-col md:flex-row">
            <FormField
              control={control}
              name="title.status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Статус произведения</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => {
                        field.onChange(typeof v === 'string' ? Number(v) : v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectGroup>
                            {list?.status.map((it) => (
                              <SelectItem value={String(it.id)} key={it.id}>
                                {it.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="title.translate_status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Статус перевода</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => {
                        field.onChange(typeof v === 'string' ? Number(v) : v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectGroup>
                            {list?.translate_status.map((it) => (
                              <SelectItem value={String(it.id)} key={it.id}>
                                {it.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TextFieldContainer>

          <TextFieldContainer className="flex-col md:flex-row">
            <FormField
              control={control}
              name="title.categories"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Категории</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value ? field.value.map(String) : []}
                      onValuesChange={(v) => {
                        field.onChange(Array.isArray(v) ? v.map(Number) : v);
                      }}
                    >
                      <MultiSelectorTrigger
                        labelResolver={NArray.newBy(list?.categories).recordBy(
                          (it) => it.id,
                          (it) => it.name
                        )}
                      >
                        <MultiSelectorInput />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {list?.categories.map((it) => (
                            <MultiSelectorItem value={String(it.id)} key={it.id}>
                              {it.name}
                            </MultiSelectorItem>
                          ))}
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="title.genres"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Жанры</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value ? field.value.map(String) : []}
                      onValuesChange={(v) => {
                        field.onChange(Array.isArray(v) ? v.map(Number) : v);
                      }}
                    >
                      <MultiSelectorTrigger
                        labelResolver={NArray.newBy(list?.genres).recordBy(
                          (it) => it.id,
                          (it) => it.name
                        )}
                      >
                        <MultiSelectorInput />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {list?.genres.map((it) => (
                            <MultiSelectorItem value={String(it.id)} key={it.id}>
                              {it.name}
                            </MultiSelectorItem>
                          ))}
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                </FormItem>
              )}
            />
          </TextFieldContainer>
          <FormField
            control={control}
            name="title.user_message"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Сообщение модератору</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionContent>
      </Section>

      {children}
    </>
  );
};
