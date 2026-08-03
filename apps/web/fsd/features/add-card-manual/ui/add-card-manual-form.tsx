import dynamic from 'next/dynamic';

import { zInventoryHeroCardCreateRequest } from '@re/api/generated/zod.gen';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useMutation } from '@tanstack/react-query';

import { getCharacterKey } from '~entities/character/model/queries';
import { CharacterQueryKeys } from '~entities/character/model/query-keys';
import { HorizontalCharacterCard } from '~entities/character/ui/horizontal-character-card';
import { useCardForms } from '~entities/inventory/model/queries';
import { HeroCardImage } from '~entities/inventory/ui/hero-card-image';
import { client } from '~shared/api/client';
import { inventoryCardsCreateMutation } from '~shared/api/generated/tanstack';
import type { CharacterSchemaFragment } from '~shared/api/models/character';
import { HeroCardRank } from '~shared/api/models/inventory';
import { SearchField as SearchFieldEnum } from '~shared/api/models/search';
import { getQueryClient } from '~shared/api/react-query';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { canSaveCond, haveChangesCond } from '~shared/lib/form/can-save-cond';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { SearchField } from '~shared/lib/search/search-field';
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
  ImageUploadEditorRoot,
  ImageUploadEditorTrigger,
  ImageUploadEditorUploader,
} from '~shared/ui/image-upload-editor';
import { Input } from '~shared/ui/input';
import { Section } from '~shared/ui/section';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { mergeFunc } from '~shared/utils/merge-funcs';
import { preventDefault } from '~shared/utils/prevent-default';

import { manualCreationAllowedRanks } from '../model/const';

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

export interface AddCardManualFormProps {
  defaultValues?: any;
  disabled?: boolean;
}

export const AddCardManualForm = (props: AddCardManualFormProps) => {
  const { defaultValues = {}, disabled = false } = props;
  const { data: filters } = useCardForms();

  const form = useForm({
    schema: zInventoryHeroCardCreateRequest,
    defaultValues: {
      ...defaultValues,
      rank: defaultValues.rank || HeroCardRank.F,
    },
    disabled,
  });

  const haveUnsavedChanges = haveChangesCond(form);
  const canSave = canSaveCond(form);

  const { mutateAsync: createHeroCard, isPending: isCreateHeroCardPending } = useMutation(
    inventoryCardsCreateMutation({ client })
  );

  const onSubmit = form.handleSubmit(
    async (fieldValues) => {
      const toast = await importToastAsync();
      try {
        await createHeroCard({ body: fieldValues });
        toast.success('Карточка была отправлена на модерацию');
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    },
    (e) => logger.error(e, { scope: ['local'] })
  );

  useBeforeUnloadAlert(haveUnsavedChanges);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Section className={cn('dark:bg-secondary flex flex-col gap-4 md:flex-row')}>
          <FormField
            control={form.control}
            name="data.cover"
            render={({ field }) => (
              <FormItem className={cn('flex w-full max-w-[200px] flex-col gap-2 self-center')}>
                <FormControl>
                  <ImageUploadEditorRoot
                    className="w-full"
                    canCrop={() => false}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <ImageUploadEditorTrigger className="w-full">
                      {({ src }) => <HeroCardImage alt="card img" src={src} />}
                    </ImageUploadEditorTrigger>
                    <ImageUploadEditorContent>
                      <ImageUploadEditorUploader
                        opts={{
                          accept: 'image/*',
                          maxSize: 5 * 1024 * 1024,
                        }}
                      />
                    </ImageUploadEditorContent>
                  </ImageUploadEditorRoot>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full flex-col gap-2">
            <FormField
              control={form.control}
              name="data.rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ранг</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {filters?.content?.ranks
                            ?.filter((it) =>
                              manualCreationAllowedRanks.includes(it.id as unknown as HeroCardRank)
                            )
                            ?.map(({ id, name }) => (
                              <SelectItem key={id} value={id as unknown as string}>
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

            <FormField
              control={form.control}
              name="data.character"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Персонаж</FormLabel>
                  <FormControl>
                    <SearchField
                      value={field.value}
                      onChange={(value) => {
                        const queryClient = getQueryClient();
                        CharacterQueryKeys.getCharacter({
                          params: {
                            characterId: field.value,
                          },
                        });

                        queryClient.setQueriesData(
                          {
                            predicate: (query) =>
                              query.queryKey ===
                              CharacterQueryKeys.getCharacter({
                                params: {
                                  characterId: field.value,
                                },
                              }),
                          },
                          () => value
                        );

                        field.onChange(value.id);
                      }}
                      opts={{
                        fields: [SearchFieldEnum.characters],
                      }}
                    >
                      {({ value, onAction }) =>
                        value ? (
                          <ContentSuspenseQuery
                            queryOptions={{
                              ...getCharacterKey({
                                variables: {
                                  params: {
                                    characterId: field.value,
                                  },
                                },
                              }),
                              enabled: !!field.value,
                            }}
                          >
                            {({ data }: { data: CharacterSchemaFragment }) =>
                              data ? (
                                <HorizontalCharacterCard
                                  model={data}
                                  actions={
                                    <Button
                                      className="mr-3 ml-auto flex-[1_0_auto]"
                                      onClick={mergeFunc(preventDefault, onAction)}
                                    >
                                      Изменить
                                    </Button>
                                  }
                                />
                              ) : null
                            }
                          </ContentSuspenseQuery>
                        ) : (
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full justify-start"
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
          </div>
        </Section>

        <div className="flex flex-col gap-2">
          <ReText size="lg" weight="semibold">
            Описание
          </ReText>
          <FormField
            control={form.control}
            name="data.description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextEditorRoot className="bg-secondary overflow-hidden rounded-sm">
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
        </div>

        <Section className="dark:bg-secondary">
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
      </form>

      <div className="flex justify-end">
        <Button
          className="mt-2"
          type="submit"
          disabled={!canSave || isCreateHeroCardPending}
          onClick={onSubmit}
        >
          Применить
        </Button>
      </div>
    </Form>
  );
};
