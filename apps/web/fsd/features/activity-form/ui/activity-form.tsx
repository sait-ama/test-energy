import {
  HTMLAttributes,
  lazy,
  PropsWithChildren,
  ReactNode,
  Suspense,
  useMemo,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from 'lexical';

import Send from '@re/ui-kit/icons/send';
import { Button } from '@re/ui-kit/ui/button';
import { Label } from '@re/ui-kit/ui/label';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { Slot } from '@re/ui-kit/ui/slot';
import { Switch } from '@re/ui-kit/ui/switch';
import { cn } from '@re/ui-kit/utils/cn';

import {
  ActivityFormRootCompoundSubmitDeps,
  ActivityFormStateContext,
  useActivityFormStateContext,
  useCompoundActivityDeps,
} from '~features/activity-form/model/context';
import {
  ActivityFormValidator,
  ActivityInputSchema,
  createActivityFormValidator,
  MaxMessageLenByRole,
} from '~features/activity-form/model/validators';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { Form, FormControl, FormField, FormItem, FormMessage, useForm } from '~shared/ui/form';
import {
  TextEditorHotKeyPlugin,
  TextEditorStickerPlugin,
} from '~shared/ui/text-editor/text-editor';

const ToolbarBold = lazy(() =>
  import(/* webpackChunkName: "ToolbarBold" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarBold,
  }))
);

const ToolbarMaxLength = lazy(() =>
  import(/* webpackChunkName: "ToolbarBold" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarMaxLength,
  }))
);

const ToolbarItalic = lazy(() =>
  import(/* webpackChunkName: "ToolbarItalic" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarItalic,
  }))
);

const ToolbarSpoiler = lazy(() =>
  import(/* webpackChunkName: "ToolbarSpoiler" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarSpoiler,
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

const TextEditorMarkdownPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorMarkdownPlugin" */ '~shared/ui/text-editor/plugins/markdown-plugin'
  ).then((m) => ({
    default: m.TextEditorMarkdownPlugin,
  }))
);

const TextEditorHotkeyLockPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorMarkdownPlugin" */ '~shared/ui/text-editor/plugins/hotkeys-lock-plugin'
  ).then((m) => ({
    default: m.TextEditorHotkeyLockPlugin,
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

const TextEditorSpoilerPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorSpoilerPlugin" */ '~shared/ui/text-editor/text-editor'
  ).then((m) => ({ default: m.TextEditorSpoilerPlugin }))
);

interface ActivityFormStateProviderProps {
  children: ReactNode;
  disabled?: boolean;
  onCancel?: () => void;
  isOpened?: boolean;
}

const ActivityFormStateProvider = ({
  children,
  disabled,
  isOpened = true,
  onCancel,
}: ActivityFormStateProviderProps) => {
  const [state, setState] = useState({
    isOpened: isOpened,
    isMarkdownToolbarShown: false,
  });

  const toggleMarkdownToolbarShown = () => {
    setState((state) => ({ ...state, isMarkdownToolbarShown: !state.isMarkdownToolbarShown }));
  };

  const toggleIsOpened = () => {
    setState((state) => ({ ...state, isOpened: !state.isOpened }));
  };

  const closeIsOpened = () => {
    setState((state) => ({ ...state, isOpened: false }));
  };

  return (
    <ActivityFormStateContext.Provider
      value={{
        state,
        disabled,
        actions: {
          toggleMarkdownToolbarShown,
          toggleIsOpened,
          closeIsOpened,
          onCancel: onCancel ?? toggleIsOpened,
        },
      }}
    >
      {children}
    </ActivityFormStateContext.Provider>
  );
};

const activityFormTriggerClassName =
  'flex bg-background justify-between text-muted-foreground w-full items-center cursor-text rounded-sm px-4 py-4 text-start text-sm';

const ActivityFormShownWrapper = ({ children, className }: HTMLAttributes<HTMLDivElement>) => {
  const { state, actions } = useActivityFormStateContext();

  const checkAuth = useLoggedCheck();

  return state.isOpened ? (
    children
  ) : (
    <button
      {...TestProps.id(`comment_input`)}
      onClick={checkAuth(actions.toggleIsOpened)}
      className={cn('cs-comment-button-trigger', activityFormTriggerClassName, className)}
    >
      Оставить комментарий
      <span className="bg-primary flex items-center justify-center rounded-full p-1">
        <Send className="size-4" />
      </span>
    </button>
  );
};

type ActivityFormRootInternal = {
  onSubmit: (values: ActivityInputSchema) => Promise<void>;
  resetOnSubmit?: boolean;
  defaultValue?: string;
  closeOnSubmit?: boolean;
  maxLength?: number;
  onSuccess?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'>;

const ActivityFormRootInternal = (props: ActivityFormRootInternal) => {
  const {
    children,
    className,
    onSubmit,
    defaultValue = '',
    maxLength = MaxMessageLenByRole.USER,
    onSuccess,
    closeOnSubmit,
    resetOnSubmit = true,
  } = props;
  const { actions } = useActivityFormStateContext();
  const [editor] = useLexicalComposerContext();
  const schema = useMemo(
    () =>
      createActivityFormValidator({
        maxLength,
      }),
    [maxLength]
  );
  const form = useForm<typeof ActivityFormValidator>({
    schema,
    defaultValues: {
      text: defaultValue,
    },
  });
  const logged = useLoggedCheck();
  const compoundOnSubmit = logged(async (values: ActivityInputSchema) => {
    try {
      await onSubmit(values);
      editor.blur();
      if (resetOnSubmit) {
        form.reset();
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, void '');
      }

      if (closeOnSubmit) {
        actions.closeIsOpened();
      }
      onSuccess?.();
    } catch (e: unknown) {
      logger.error(e);
    }
  });

  return (
    <ActivityFormRootCompoundSubmitDeps
      value={{ compoundOnSubmit: form.handleSubmit(compoundOnSubmit) }}
    >
      <Form {...form}>
        <form
          id="activity-form"
          onSubmit={form.handleSubmit(compoundOnSubmit)}
          className={cn('w-full', className)}
        >
          {children}
        </form>
      </Form>
    </ActivityFormRootCompoundSubmitDeps>
  );
};

const ActivityFormRoot = ({
  children,
  isOpened,
  disabled,
  onSubmit,
  onCancel,
  className,
  onSuccess,
  defaultValue,
  closeOnSubmit,
  resetOnSubmit,
}: ActivityFormRootInternal & ActivityFormStateProviderProps) => {
  const isStaff = useSession((v) => v?.is_staff);
  const maxLength = isStaff ? MaxMessageLenByRole.STAFF : MaxMessageLenByRole.USER;
  return (
    <Suspense
      fallback={
        <div className={cn('cs-comment-button-trigger', activityFormTriggerClassName)}>
          Оставить комментарий
          <span className="bg-primary flex items-center justify-center rounded-full p-1">
            <Send className="size-4" />
          </span>
        </div>
      }
    >
      <TextEditorRoot className="cs-comment-input-section w-full" maxLength={maxLength}>
        <ActivityFormStateProvider disabled={disabled} isOpened={isOpened} onCancel={onCancel}>
          <ActivityFormShownWrapper className={cn('cs-comment-form-root', className)}>
            <ActivityFormRootInternal
              maxLength={maxLength}
              onSuccess={onSuccess}
              closeOnSubmit={isOpened || closeOnSubmit}
              onSubmit={onSubmit}
              resetOnSubmit={resetOnSubmit}
              defaultValue={defaultValue}
            >
              {children}
            </ActivityFormRootInternal>
          </ActivityFormShownWrapper>
        </ActivityFormStateProvider>
      </TextEditorRoot>
    </Suspense>
  );
};

const ActivityFormContent = ({
  children,
  autoFocus = true,
  onSubmit,
}: {
  children: ReactNode;
  autoFocus?: boolean;
  onSubmit: (values: { text: string }) => Promise<void>;
}) => {
  const form = useFormContext();
  const { compoundOnSubmit } = useCompoundActivityDeps();
  const onHotKeySubmit = () => {
    compoundOnSubmit?.();
  };
  return (
    <FormField
      control={form.control}
      name="text"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <TextEditorSpoilerPlugin />
          <TextEditorMarkdownPlugin />
          <TextEditorClearPlugin />
          <TextEditorHotkeyLockPlugin />
          <TextEditorOnChangePlugin onChange={field.onChange} />
          <TextEditorDefaultValuePlugin defaultValue={field.value} />
          <TextEditorHotKeyPlugin onSubmit={onHotKeySubmit} />
          <TextEditorStickerPlugin
            sendSticker={async (html) => {
              try {
                await onSubmit?.({ text: html.outerHTML });
              } catch (e) {
                logger.error(e);
              }
            }}
          />
          {autoFocus && <TextEditorAutoFocusPlugin />}
          {children}
          <FormMessage className="pb-3 pl-3" />

          {/*<FormDescription className="mx-2 text-xs">{field.value?.length ?? 0}/500</FormDescription>*/}
        </FormItem>
      )}
    />
  );
};

const ActivityFormTextArea = () => (
  <div className="w-full">
    <TextEditorEditableArea className="p-4" />
  </div>
);

const ActivityFormSwitch = ({
  name,
  label,
}: {
  name: 'is_spoiler' | 'is_pinned';
  label: string;
}) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-center space-y-0 space-x-2">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <Label className="mt-0" htmlFor={name}>
            {label}
          </Label>
        </FormItem>
      )}
    />
  );
};

const ActivityMarkdownToolbar = () => {
  const { state } = useActivityFormStateContext();

  if (!state.isMarkdownToolbarShown) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-row gap-2">
          <Skeleton count={3} className="size-4" />
        </div>
      }
    >
      <ToolbarRoot>
        <ToolbarBold />
        <ToolbarItalic />
        <ToolbarStrikethrough />
      </ToolbarRoot>
    </Suspense>
  );
};

const ActivityToggleMarkdownToolbarShown = () => {
  const { state, actions } = useActivityFormStateContext();

  return (
    <Button
      variant={state.isMarkdownToolbarShown ? 'default' : 'ghost'}
      size="sm"
      circle
      type="button"
      onClick={actions.toggleMarkdownToolbarShown}
    >
      T
    </Button>
  );
};

const ActivityBottomBar = ({
  children,
  additionalActions,
}: PropsWithChildren & { additionalActions?: ReactNode }) => {
  return (
    <Suspense fallback="">
      <ToolbarRoot className="justify-between gap-2 pb-2">
        <div className="flex gap-1.5">
          <ToolbarSpoiler />
          <ActivityToggleMarkdownToolbarShown />
          {additionalActions}
          <div className="flex-1" />
        </div>
        <div className="flex gap-2">
          <ToolbarMaxLength />
          {children}
        </div>
      </ToolbarRoot>
    </Suspense>
  );
};

const ActivityFormSubmit = ({
  children,
  asChild = false,
  ...rest
}: {
  asChild?: boolean;
} & HTMLAttributes<HTMLButtonElement>) => {
  const { disabled } = useActivityFormStateContext();
  const Component = asChild ? Slot : Button;
  const {
    formState: { isSubmitting },
  } = useFormContext();

  const isDisabled = disabled || isSubmitting;

  return (
    //   @ts-ignore
    <Component
      size="sm"
      type="submit"
      className={cn(isDisabled && 'opacity-35')}
      {...rest}
      disabled={isDisabled}
    >
      {children}
    </Component>
  );
};

const ActivityFormCancel = ({
  children,
  asChild = false,
  ...rest
}: {
  asChild?: boolean;
} & HTMLAttributes<HTMLButtonElement>) => {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  const { actions } = useActivityFormStateContext();
  const Component = asChild ? Slot : Button;

  return (
    //@ts-ignore
    <Component
      disabled={isSubmitting}
      size="sm"
      variant="outline"
      onClick={() => actions?.onCancel?.()}
      {...rest}
    >
      {children}
    </Component>
  );
};

export const ActivityForm = Object.assign(ActivityFormRoot, {
  Content: ActivityFormContent,
  Switch: ActivityFormSwitch,
  Submit: ActivityFormSubmit,
  Cancel: ActivityFormCancel,
  TextArea: ActivityFormTextArea,
  MarkdownToolbar: ActivityMarkdownToolbar,
  BottomBar: ActivityBottomBar,
});
