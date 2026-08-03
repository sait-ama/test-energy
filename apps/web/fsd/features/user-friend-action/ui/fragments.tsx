import { ComponentProps, lazy, PropsWithChildren, ReactNode, Suspense, useState } from 'react';
import { DropdownProps } from 'react-day-picker';
import { useFormContext } from 'react-hook-form';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { captureException } from '@sentry/nextjs';
import { z } from 'zod';

import { createContext } from '@re/core/utils/create-context';
import Send from '@re/ui-kit/icons/send';
import { DialogProps } from '@re/ui-kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { Skeleton, SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useMediaQuery } from '~shared/hooks/use-media-query';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';
import { Form, FormField, useForm } from '~shared/ui/form';
import {
  TextEditorContainer,
  TextEditorHotKeyPlugin,
  TextEditorStickerPlugin,
} from '~shared/ui/text-editor/text-editor';
import { ActivityStickerPicker } from '~widgets/activity/ui/fragments/activite-sticker-picker';

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
const TextEditorClearPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorClearPlugin" */ '~shared/ui/text-editor/plugins/clear-editor-plugin'
  ).then((m) => ({
    default: m.TextEditorClearPlugin,
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

const schema = z.object({ message: z.string() });
type SendRequestFormRootProps = {
  onSubmit: (vals: { message: string }) => Promise<void>;
  disabled?: boolean;
  onSuccess?: () => void;
} & PropsWithChildren;
type SendRequestDepsStore = {
  onSubmit: (vals: { message: string }) => Promise<void>;
  onSuccess?: () => void;
  disabled?: boolean;
  compoundOnSubmit: (vals: { message: string }) => void;
};
const { Provider: SendRequestDepsProvider, Consumer: SendRequestDepsConsumer } = createContext<
  SendRequestDepsStore,
  SendRequestDepsStore
>((v) => {
  return v;
}, 'SendRequestDeps');
export const SendRequestFormRoot = ({
  children,
  onSubmit,
  onSuccess,
  disabled,
}: SendRequestFormRootProps) => {
  const form = useForm({ schema, defaultValues: { message: '' } });
  const logged = useLoggedCheck();

  const [editor] = useLexicalComposerContext();
  const compoundOnSubmit = logged(async (values: z.infer<typeof schema>) => {
    try {
      if (!disabled) {
        await onSubmit?.(values);
        editor.blur();
        onSuccess?.();
      }
    } catch (e: unknown) {
      captureException(e);
    }
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(compoundOnSubmit, (e) => console.log(e))}>
        <SendRequestDepsProvider value={{ onSubmit, disabled, onSuccess, compoundOnSubmit }}>
          {children}
        </SendRequestDepsProvider>
      </form>
    </Form>
  );
};
export const TextEditorField = ({
  submitButton,
}: {
  submitButton?: (props: { isSubmitting: boolean }) => ReactNode;
}) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<z.infer<typeof schema>>();

  return (
    <FormField
      control={control}
      render={({ field: { value, onChange } }) => (
        <TextEditorContainer className="flex items-center justify-between gap-2 p-0 pl-2">
          <span className="flex h-[37px] items-center self-end">
            <ActivityStickerPicker />
          </span>
          <span className="w-full flex-1">
            <Suspense fallback={<Skeleton className="h-[37px] w-full rounded-sm" />}>
              <TextEditorEditableArea className="min-h-none w-full" />
            </Suspense>
            <TextEditorMarkdownPlugin />
            <SendRequestDepsConsumer>
              {({ compoundOnSubmit, disabled }) =>
                disabled ? null : (
                  <TextEditorStickerPlugin
                    sendSticker={async (html) => {
                      try {
                        if (!disabled) compoundOnSubmit?.({ message: html.outerHTML });
                      } catch (e) {
                        captureException(e);
                      }
                    }}
                  />
                )
              }
            </SendRequestDepsConsumer>
            <SendRequestDepsConsumer>
              {({ compoundOnSubmit, disabled }) =>
                disabled ? null : (
                  <TextEditorHotKeyPlugin onSubmit={handleSubmit(compoundOnSubmit)} />
                )
              }
            </SendRequestDepsConsumer>
            <TextEditorClearPlugin />
            <TextEditorOnChangePlugin onChange={onChange} />
            <TextEditorDefaultValuePlugin defaultValue={value} />
            <TextEditorAutoFocusPlugin />
          </span>

          {!submitButton && (
            <button
              aria-label="Отправить сообщение"
              type="submit"
              disabled={isSubmitting}
              style={{ padding: 8 }}
              className={cn(
                'bg-primary transition-invisible bg-primary flex size-[37px] items-center justify-center self-end rounded-full duration-300',
                {
                  // invisible: !isValid && !isLoading,
                }
              )}
            >
              <Send />
            </button>
          )}
          {submitButton && submitButton?.({ isSubmitting })}
        </TextEditorContainer>
      )}
      name="message"
    />
  );
};
export const { Provider: SendMessageDeps, useStore: useSendMessageDeps } = createContext<
  {
    isMobile?: boolean | undefined;
    disabled?: boolean;
    onSubmit: (vals: { message: string }) => Promise<void>;
    onSuccess?: () => void;
  },
  {
    isMobile?: boolean | undefined;
    onSuccess?: () => void;
    disabled?: boolean;
    onSubmit: (vals: { message: string }) => Promise<void>;
  }
>((v) => v);

export const SendMessageRoot = ({
  children,
  onSubmit,
  fallbackClassName,
  ...props
}: PropsWithChildren &
  DialogProps &
  DropdownProps &
  ComponentProps<typeof Drawer> & {
    onSubmit: (vals: { message: string }) => Promise<void>;
    fallbackClassName?: string;
  }) => {
  const isMobile = useMediaQuery(`(max-width: 800px)`, { defaultValue: undefined });
  const [open, setOpen] = useState(false);
  const Root = !isMobile ? DropdownMenu : Drawer;

  return (
    <SkeletonSlot
      force={isMobile}
      className={fallbackClassName}
      show={isMobile === undefined}
      render={
        <SendMessageDeps
          value={{
            isMobile,
            onSubmit,
            onSuccess: () => {
              setOpen(false);
            },
          }}
        >
          <Root open={open} onOpenChange={setOpen} key={`root_${isMobile}`} {...props}>
            {children}
          </Root>
        </SendMessageDeps>
      }
    />
  );
};
export const SendMessageRequestTrigger = ({
  children,
  className,
  ...props
}: ComponentProps<typeof DrawerTrigger> & ComponentProps<typeof DropdownMenuTrigger>) => {
  const isMobile = useSendMessageDeps((v) => v.isMobile);

  const Trigger = !isMobile ? DropdownMenuTrigger : DrawerTrigger;

  return (
    <Trigger key={`trigger_${isMobile}`} className={className} asChild {...props}>
      {children}
    </Trigger>
  );
};
export const SendMessageRequestInput = ({
  renderSubmitButton,
  className,
}: {
  className?: string;
  renderSubmitButton?: (props: { isSubmitting: boolean }) => ReactNode;
}) => {
  const onSubmit = useSendMessageDeps((v) => v.onSubmit);
  const onSuccess = useSendMessageDeps((v) => v.onSuccess);
  const disabled = useSendMessageDeps((v) => v.disabled);

  return (
    <Suspense
      fallback={
        <Skeleton
          className={cn(
            'bg-secondary/40 max-h-[300px] w-full max-w-full rounded-md border-2 px-2 py-2 md:max-w-[350px] md:min-w-[250px]',
            className
          )}
        />
      }
    >
      <TextEditorRoot
        className="w-full"
        innerClassName={cn(
          'px-1 w-full max-h-[300px] overflow-y-hidden py-1 w-full bg-secondary/40 rounded-md border-2  md:min-w-[250px] max-w-full md:max-w-[350px]',
          className
        )}
      >
        <SendRequestFormRoot disabled={disabled} onSuccess={onSuccess} onSubmit={onSubmit}>
          <TextEditorField submitButton={renderSubmitButton} />
        </SendRequestFormRoot>
      </TextEditorRoot>
    </Suspense>
  );
};
export const SendMessageRequestTitle = ({
  children,
  ...props
}: ComponentProps<typeof ReText> & ComponentProps<typeof DrawerTitle>) => {
  return (
    <ReText weight="medium" {...props}>
      {children}
    </ReText>
  );
};
export const SendMessageRequestLayout = ({
  children,
  className,
  ...props
}: ComponentProps<typeof DropdownMenuContent> & ComponentProps<typeof DrawerContent>) => {
  const isMobile = useSendMessageDeps((v) => v.isMobile);
  const Content = !isMobile ? DropdownMenuContent : DrawerContent;

  return (
    <Content
      key={`content${isMobile}`}
      className={cn('flex flex-col gap-4 p-4', className)}
      {...props}
    >
      {children}
    </Content>
  );
};
