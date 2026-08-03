import { useFormContext } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { Separator } from '@re/ui-kit/ui/separator';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

// import { Input } from '~shared/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';

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
const TextEditorControlledValuePlugin = dynamic(
  () =>
    import('~shared/ui/text-editor/plugins/controlled-value-plugin').then((m) => ({
      default: m.TextEditorControlledValuePlugin,
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

export interface NovelEditorProps {
  previewedName?: string;
  controlledValueName: string;
  textName: string;
  className?: string;
}

export const NovelEditor = ({
  previewedName,
  textName,
  className,
  controlledValueName,
}: NovelEditorProps) => {
  'use no memo';

  const { watch, control } = useFormContext();

  //@ts-ignore
  const value = watch(previewedName);
  const controlledValue = value?.fields?.file;
  const content = value?.fields?.content;

  const previewed = value || null;

  return (
    <div className={cn('flex flex-col items-stretch gap-4', className)}>
      <ReText size="xl">
        Том {previewed?.tome || '?'} Глава {previewed?.chapter || '?'}
        {previewed?.name ? `"${previewed.name}"` : null}
      </ReText>
      <FormField
        control={control}
        key={textName}
        name={textName}
        render={({ field }) => (
          <FormItem className="flex-[1]">
            <FormControl>
              <TextEditorRoot>
                <ToolbarRoot>
                  <ToolbarBold />
                  <ToolbarItalic />
                  <ToolbarStrikethrough />
                </ToolbarRoot>
                <Separator />
                <TextEditorContainer>
                  <TextEditorEditableArea />
                  <TextEditorMarkdownPlugin />
                  <TextEditorOnChangePlugin onChange={field.onChange} />
                  <TextEditorControlledValuePlugin triggerKey={controlledValue} value={content} />
                  <TextEditorDefaultValuePlugin defaultValue={field.value} />
                  <TextEditorAutoFocusPlugin />
                </TextEditorContainer>
              </TextEditorRoot>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
