import { useFormContext } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { Button } from '@re/ui-kit/ui/button';
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@re/ui-kit/ui/multi-select';
import { Switch } from '@re/ui-kit/ui/switch';
import { useQuery } from '@tanstack/react-query';

import { reV2TitlesMomentsTagsListOptions } from '~entities/title/model/queries';
import type { MomentFormSchema } from '~features/create-moment-form/model/validator';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~shared/ui/form';
import { NArray } from '~shared/utils/NArray';
import { noopObject } from '~shared/utils/noop';

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

export const CreateMomentForm = () => {
  const form = useFormContext<MomentFormSchema>();
  const { data: list } = useQuery(reV2TitlesMomentsTagsListOptions({ api: noopObject }));
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-3">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Изображение</FormLabel>
            <img src={field.value} alt="img" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <TextEditorRoot>
                <TextEditorContainer>
                  <TextEditorEditableArea />
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
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Теги</FormLabel>
            <FormControl>
              <MultiSelector
                values={field.value ? field.value.map(String) : []}
                onValuesChange={(v) => {
                  field.onChange(Array.isArray(v) ? v.map(Number) : v);
                }}
              >
                <MultiSelectorTrigger
                  labelResolver={NArray.newBy(list).recordBy(
                    (it) => it.id,
                    (it) => it.name
                  )}
                >
                  <MultiSelectorInput />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {list?.map((it) => (
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
      <div className="flex items-center justify-between gap-2">
        <FormField
          control={form.control}
          name="is_spoiler"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mb-0">Спойлер</FormLabel>
            </FormItem>
          )}
        />
        <Button loading={isSubmitting} type="submit">
          Подтвердить
        </Button>
      </div>
    </div>
  );
};
