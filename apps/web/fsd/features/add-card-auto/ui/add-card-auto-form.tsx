import React, { ReactNode, useEffect } from 'react';
import { type FieldPath, SubmitHandler, useFormContext } from 'react-hook-form';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import type { FieldValues } from 'react-hook-form/dist/types/fields';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';

import { zInventoryHeroCardCreateRequest } from '@re/api/generated/zod.gen';
import ArrowRightIcon from '@re/ui-kit/icons/arrow-right';
import { Alert, AlertDescription, AlertTitle } from '@re/ui-kit/ui/alert';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useMutation } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import z from 'zod';

import { HorizontalCharacterCard } from '~entities/character/ui/horizontal-character-card';
import { useCardForms } from '~entities/inventory/model/queries';
import { AutoCardFormProvider, useAutoCardForm } from '~features/add-card-auto/model/context';
import { client } from '~shared/api/client';
import { v2CardGenGenerateCreate } from '~shared/api/generated/repositories';
import {
  inventoryCardsCreateMutation,
  v2CardGenStatusRetrieveOptions,
  v2CardGenStatusRetrieveQueryKey,
} from '~shared/api/generated/tanstack';
import { HeroCardRank } from '~shared/api/models/inventory';
import { SearchField as SearchFieldEnum, SearchItem } from '~shared/api/models/search';
import { queryClient } from '~shared/api/react-query';
import Title from '~shared/assets/placeholders/title';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { SearchField } from '~shared/lib/search/search-field';
import { FileUploader, FileUploaderTrigger } from '~shared/ui/file-uploader';
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
  ImageEditorActionsContainer,
  ImageEditorArea,
  ImageEditorCancel,
  ImageEditorRoot,
  ImageEditorSubmit,
} from '~shared/ui/image-editor';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { fileToBase64 } from '~shared/utils/file-to-base64';

import { autoCreationAllowedRanks } from '../model/const';
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

const RANK_COLORS: Record<string, string> = {
  rank_a: 'hsl(var(--r-rank-a))',
  rank_b: 'hsl(var(--r-rank-b))',
  rank_c: 'hsl(var(--r-rank-c))',
  rank_d: 'hsl(var(--r-rank-d))',
  rank_e: 'hsl(var(--r-rank-e))',
  rank_f: 'hsl(var(--r-rank-f))',
};

const MainInfoSection = () => {
  const form = useFormContext(); // todo: pass generic;
  const { data: filters } = useCardForms();
  const { setCharacter, character } = useAutoCardForm();

  return (
    <Section className="dark:bg-secondary flex w-full flex-col gap-4">
      <SectionTitle>Основная информация</SectionTitle>
      <SectionContent className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="data.rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ранг</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {filters?.content?.ranks
                    ?.filter((it) =>
                      autoCreationAllowedRanks.includes(it.id as unknown as HeroCardRank)
                    )
                    ?.map(({ id, name }) => {
                      const isSelected = field.value === id;
                      const rankLetter = id.toString().replace('rank_', '').toUpperCase();
                      const rankColor =
                        RANK_COLORS[id as string] || 'hsl(var(--r-muted-foreground))';

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => field.onChange(id)}
                          className={cn(
                            'hover:border-primary/50 bg-card flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all',
                            isSelected ? 'border-primary' : 'border-border'
                          )}
                        >
                          <ReText
                            size="2xl"
                            weight="bold"
                            style={{
                              color: rankColor,
                            }}
                          >
                            {rankLetter}
                          </ReText>
                          <ReText size="sm">{name}</ReText>
                        </button>
                      );
                    })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data.character"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Персонаж</FormLabel>
              <FormControl>
                <SearchField
                  value={field.value}
                  onChange={(value: SearchItem<SearchFieldEnum.characters>) => {
                    field.onChange(value.id);
                    setCharacter(value);
                  }}
                  opts={{
                    fields: [SearchFieldEnum.characters],
                  }}
                >
                  {({ value, onAction }) =>
                    value ? (
                      <HorizontalCharacterCard model={character} className="bg-card" />
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        className="bg-card w-full justify-start"
                        onClick={onAction}
                      >
                        Выбрать
                      </Button>
                    )
                  }
                </SearchField>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <TextEditorRoot className="bg-card rounded-sm">
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
              <FormDescription>Ссылки на сторонние источники запрещены.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionContent>
    </Section>
  );
};

const cardGeneratingIndicator = (
  <div className="border-muted-foreground/25 flex aspect-[2/3] h-full w-full max-w-[280px] flex-col items-center justify-center rounded-sm border-2 border-dashed p-8">
    <div className="border-muted-foreground/20 flex h-16 w-16 items-center justify-center rounded-full border-2">
      <div className="border-muted-foreground/20 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
    </div>
    <ReText size="sm" className="text-muted-foreground mt-6 text-center">
      Примерное время
      <br />
      ожидания <span className="text-foreground">30 сек</span>
    </ReText>
  </div>
);

interface CardGeneratedLoaderProps {
  taskId: string;
}

const CardGeneratedLoader = (props: CardGeneratedLoaderProps) => {
  const { taskId } = props;

  useEffect(() => {
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: v2CardGenStatusRetrieveQueryKey({ path: { task_id: taskId } }),
      });
    }, 5 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [taskId]);

  return cardGeneratingIndicator;
};

interface CheckIfFieldsFilledProps {
  children: ReactNode;
}

const CheckIfRequiredImageFieldsFilled = (props: CheckIfFieldsFilledProps) => {
  const { children } = props;
  const form = useFormContext(); // todo: pass generic;

  const rank = form.watch('data.rank');
  const character = form.watch('data.character');

  const isFilled = rank && character;

  if (isFilled) return children;

  return (
    <div
      className={cn(
        'bg-card border-muted-foreground/25 bg-card flex aspect-[2/3] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-sm border-2 border-dashed p-8'
      )}
    >
      <ReText size="sm" className="text-center" color="muted-foreground">
        Чтобы прикрепить картинку, нужно заполнить поля "Ранг" и "Персонаж".
      </ReText>
    </div>
  );
};

const CardImageUploaderField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  onChange,
  value,
}: ControllerRenderProps<TFieldValues, TName>) => {
  const form = useFormContext(); // todo: pass generic;
  const rank = form.watch('data.rank');
  const { setCrop } = useAutoCardForm();

  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [tempFile, setTempFile] = React.useState<File | undefined>();
  const [tempBase64, setTempBase64] = React.useState<string | undefined>();

  const handleFileUpload = async (files: File[]) => {
    if (files[0]) {
      const b64 = await fileToBase64(files[0]);
      setTempFile(files[0]);
      setTempBase64(b64);
      setIsEditorOpen(true);
    }
  };

  if (value && !isEditorOpen) {
    const containerWidth = 280;
    const originalWidth = 1623;
    const originalHeight = 2441;

    const widthScale = containerWidth / originalWidth;

    const containerHeight = originalHeight * widthScale;

    const scale = widthScale;
    const originalPaddingInline = 67;
    const originalPaddingVertical = 52;

    const originalBorderInline = 35;
    const originalBorderVertical = 35;

    const originalImageWidth = 1489;
    const originalImageHeight = 2262;
    const originalImageScale = originalImageWidth / originalImageHeight;

    const offsetLeft = scale * (originalPaddingInline + originalBorderInline);
    const containerImageWidth = containerWidth - offsetLeft * 2 + 1;

    return (
      <div className="flex w-full flex-col items-end gap-3">
        <div
          style={{
            paddingInline: originalPaddingInline * scale,
            width: containerWidth,
            height: containerHeight,
            paddingBlock: originalPaddingVertical * scale,
          }}
          className="flex h-full items-start"
        >
          <div
            className="relative h-full w-full"
            style={{
              paddingInline: originalBorderInline * scale,
              paddingBlock: originalBorderVertical * scale,
            }}
          >
            <div className="relative h-full w-full">
              <NextImage
                alt="card img"
                fill
                src={value as string}
                className="object-cover object-left-top"
              />
            </div>
            <NextImage
              src={`/card-creator/${rank as string}.png`}
              fill
              alt={rank}
              className="absolute top-0 left-0 flex h-full w-full items-center justify-center"
            />
          </div>
        </div>
        <div className="flex w-full max-w-[280px] gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              setTempBase64(value as string);
              setIsEditorOpen(true);
            }}
          >
            Изменить
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => {
              onChange('');
              setTempFile(undefined);
              setTempBase64(undefined);
            }}
          >
            Удалить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FileUploader
        value={tempFile ? [tempFile] : []}
        onValueChange={handleFileUpload}
        className="bg-card aspect-[2/3] max-w-[280px]"
        opts={{
          accept: 'image/*',
          maxSize: 5 * 1024 * 1024,
          maxFiles: 1,
        }}
      >
        <FileUploaderTrigger />
      </FileUploader>

      {isEditorOpen && tempBase64 && (
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <ImageEditorRoot
              image={tempBase64}
              onCropChange={debounce((crop) => {
                setCrop(crop);
              })}
              onImageChange={(croppedImage) => {
                onChange(croppedImage);
              }}
              aspect={1419 / 2262}
            >
              <ImageEditorArea>
                {({ src, ref, onLoad }) => (
                  <img
                    src={src}
                    alt="Изображение"
                    className="aspect-[1419/2262] max-w-[200px] object-cover"
                    ref={ref}
                    onLoad={onLoad}
                  />
                )}
              </ImageEditorArea>
              <ImageEditorActionsContainer>
                <ImageEditorCancel
                  onClick={() => {
                    setIsEditorOpen(false);
                    setTempFile(undefined);
                    setTempBase64(undefined);
                  }}
                />
                <ImageEditorSubmit
                  onClick={() => {
                    setIsEditorOpen(false);
                    setTempFile(undefined);
                    setTempBase64(undefined);
                  }}
                />
              </ImageEditorActionsContainer>
            </ImageEditorRoot>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const CardPreviewField = () => {
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const form = useFormContext(); // todo: pass generic;
  const { crop, character } = useAutoCardForm();

  const handleGenerate = async () => {
    const values = form.getValues();

    // trigger necessary validation
    console.log(values);
    const img = new Image();
    img.src = values.data.cover;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const currentWidth = img.width;
    const currentHeight = img.height;
    const targetWidth = 1489;
    const targetHeight = 2262;

    const widthScale = targetWidth / currentWidth;
    const heightScale = targetHeight / currentHeight;
    console.log(currentHeight, currentWidth, heightScale, widthScale, crop);

    const scale = Math.max(widthScale, heightScale);

    const response = await v2CardGenGenerateCreate({
      client,
      body: {
        rank: values.data.rank.slice(5).toUpperCase(),
        character_name: character?.name ?? '',
        title_name: character?.titles[0]?.main_name ?? '',
        image_base64: values.data.cover.split(',')[1],
        image_transform: {
          scale: scale,
          x: (scale * (currentWidth * (crop?.x ?? 0))) / 100,
          y: (scale * (currentHeight * (crop?.y ?? 0))) / 100,
        },
      },
    });

    setTaskId(response.data!.task_id);
  };

  if (!taskId)
    return (
      <div className="flex flex-col gap-4">
        <div className="border-muted-foreground/25 bg-card flex aspect-[2/3] h-full w-full flex-col items-center justify-center rounded-sm border-2 border-dashed p-8">
          <Title size={64} color="muted-foreground" />
        </div>
        <Button onClick={handleGenerate} size="lg" className="w-full" disabled={!crop}>
          Сгенерировать
        </Button>
      </div>
    );

  return (
    <QuerySuspenseContainer fallback={cardGeneratingIndicator}>
      <ContentSuspenseQuery
        queryOptions={v2CardGenStatusRetrieveOptions({
          client,
          path: { task_id: taskId },
        })}
      >
        {({ data }) =>
          data.result ? (
            <div className="relative w-full">
              <NextImage
                src={`data:${data.result!.mime_type};base64,${data.result!.card_base64}`}
                alt="card img"
                width={280}
                height={420}
                className="rounded-lg"
              />
            </div>
          ) : (
            <CardGeneratedLoader taskId={taskId} />
          )
        }
      </ContentSuspenseQuery>
    </QuerySuspenseContainer>
  );
};

const ImagePreviewSection = () => {
  const form = useFormContext(); // todo: pass generic;

  return (
    <Section className="dark:bg-secondary">
      <SectionTitle>Изображение</SectionTitle>
      <SectionContent className="flex w-full flex-row justify-center gap-8">
        <FormField
          control={form.control}
          name="data.cover"
          render={({ field }) => (
            <FormItem className="flex flex-[45%] flex-col items-end justify-start gap-4">
              <div className="flex size-full max-w-[280px] flex-col items-center gap-4">
                <FormLabel className="text-muted-foreground mb-0 text-center">
                  Изображение для генерации
                </FormLabel>
                <FormControl>
                  <CheckIfRequiredImageFieldsFilled>
                    <CardImageUploaderField {...field} />
                  </CheckIfRequiredImageFieldsFilled>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="border-border flex size-10 items-center justify-center self-center rounded-full border">
          <ArrowRightIcon className="rotate-90 md:rotate-0" />
        </div>

        <div className="flex-[45%]">
          <div className="flex max-w-[280px] flex-col gap-4">
            <FormLabel className="text-muted-foreground mb-0 text-center">
              Сгенерированная карта
            </FormLabel>

            <CardPreviewField />
          </div>
        </div>
      </SectionContent>
    </Section>
  );
};

export interface AddCardAutoFormProps {
  disabled?: boolean;
}

export const AddCardAutoForm = (props: AddCardAutoFormProps) => {
  'use no memo';
  const { disabled = false } = props;

  const form = useForm({
    schema: zInventoryHeroCardCreateRequest,
    defaultValues: {
      data: { rank: 'rank_f' },
    },
    disabled,
    mode: 'onChange',
  });

  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);

  const { mutateAsync: createHeroCard, isPending: isCreateHeroCardPending } = useMutation(
    inventoryCardsCreateMutation({ client })
  );

  const onSubmit: SubmitHandler<z.infer<typeof zInventoryHeroCardCreateRequest>> = async (
    fieldValues
  ) => {
    const toast = await importToastAsync();
    try {
      await createHeroCard({
        body: fieldValues,
      });

      toast.success('Карточка была отправлена на модерацию'); // TODO: i18n
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  useBeforeUnloadAlert(haveUnsavedChanges);

  return (
    <Form {...form}>
      {/* @ts-ignore */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <AutoCardFormProvider>
          <Alert severity="error">
            <AlertTitle>Внимание!</AlertTitle>
            <AlertDescription>
              Эта функция находится в экспериментальном режиме и может работать нестабильно.
            </AlertDescription>
          </Alert>
          <MainInfoSection />
          <ImagePreviewSection />
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSave || isCreateHeroCardPending}>
              Отправить
            </Button>
          </div>
        </AutoCardFormProvider>
      </form>
    </Form>
  );
};
