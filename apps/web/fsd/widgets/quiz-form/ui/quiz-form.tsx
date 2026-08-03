import { ReactNode, useState } from 'react';
import { DeepPartial, useForm, useFormContext } from 'react-hook-form';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import dayjs from 'dayjs';

import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { QuizQuestionType } from '~shared/api/models/quiz';
import { Calendar } from '~shared/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { TimePicker } from '~shared/ui/time-picker/time-picker';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { QuizFormSchema } from '../model/schema';
import { QuizMutateContext } from '../model/store';
import { createEmptyQuestion } from '../model/utils';

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

export interface QuizFormRootProps {
  children: ReactNode;
  defaultValues?: DeepPartial<QuizFormSchema>;
}
export const QuizFormRoot = (props: QuizFormRootProps) => {
  const { children, defaultValues } = props;
  const form = useForm<QuizFormSchema>({
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      date_end: null,
      questions: [createEmptyQuestion(QuizQuestionType.SINGLE, true)],
    },
  });

  return <Form {...form}>{children}</Form>;
};

export const QuizFormTitleField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} type="text" placeholder="*Название" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const QuizFormDescriptionField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TextEditorRoot className="bg-secondary rounded-sm">
              <TextEditorContainer>
                <TextEditorEditableArea
                  placeholder={
                    <ReText className="absolute top-4 opacity-50" color="muted-foreground">
                      *Описание
                    </ReText>
                  }
                />
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
  );
};

interface QuizFormDateEndFieldProps {
  className?: string;
}

export const QuizFormDateEndField = ({ className }: QuizFormDateEndFieldProps) => {
  const tForm = useTranslations('form');
  const tReusable = useTranslations('reusable');

  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  const { control } = useFormContext();

  const [open, setOpen] = useState(false);

  return (
    <FormField
      name="end_at"
      control={control}
      render={({ field }) => (
        <FormItem className={className}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant="secondary" className="w-full">
                  {field.value ? field.value : <span>{tForm('labels.date-end')}</span>}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Calendar
                defaultMonth={field.value ? new Date(field.value) : new Date()}
                captionLayout="dropdown-buttons"
                mode="single"
                selected={field.value ? dayjs(field.value, dateFormat).toDate() : undefined}
                onSelect={(value) => {
                  field.onChange(value ? dayjs(value).format(dateFormat).toString() : undefined);
                }}
                disabled={(date) => +date < +new Date()}
                fromDate={new Date()}
                initialFocus
              />

              <div className="flex w-full items-center justify-between gap-2 p-3 pt-0">
                <TimePicker
                  withHours
                  withMinutes
                  date={field.value ? dayjs(field.value, dateFormat).toDate() : undefined}
                  setDate={(value) => {
                    field.onChange(value ? dayjs(value).format(dateFormat) : undefined);
                  }}
                />
                <Button
                  color="secondary"
                  onClick={() => {
                    field.onChange(null);
                  }}
                >
                  {tReusable('actions.reset')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export interface QuizFormSubmitButton extends Omit<ButtonProps, 'onClick'> {}

export const QuizFormSubmitButton = (props: QuizFormSubmitButton) => {
  const {
    actions: { handleSubmit },
  } = useStrictContext(QuizMutateContext);

  return <Button onClick={handleSubmit} {...props} />;
};
