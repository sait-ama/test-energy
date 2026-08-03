'use client';
import { lazy, memo, Suspense, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { ReText } from '@re/ui-kit/ui/text';

import { useFriendlyDomains } from '~app/providers/site-config-provider';
import { entityResolver } from '~features/editor/attachments/ui/editor-views/resolvers';
import { useSession } from '~shared/lib/session/use-session';
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { EntityNodeViewProvider } from '~shared/ui/text-editor/nodes/store';
import { cn } from '~shared/utils/cn';
import { useStrictContext } from '~shared/utils/use-strict-context';
import { MAX_POST_LENGTH } from '~widgets/post/(forum)/forum-post-changing-form/model/const';

import { PostAttachmentsContext } from '../../../model/store';

const ToolbarMentionButton = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarMentionButton" */ '~features/editor/attachments/ui/toolbar/mention/entity-mention-toolbar-button'
  ).then((m) => ({
    default: m.ToolbarMentionButton,
  }))
);

const ToolbarEntityMentionPopover = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarEntityMentionPopover" */ '~features/editor/attachments/ui/toolbar/mention/entity-mention-toolbar-popover'
  ).then((m) => ({
    default: m.ToolbarEntityMentionPopover,
  }))
);

const TextEditorEntityBlockPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorEntityBlockPlugin" */ '~shared/ui/text-editor/plugins/entity-block-plugin'
  ).then((m) => ({
    default: m.TextEditorEntityBlockPlugin,
  }))
);

const TextEditorEntityMentionPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorEntityMentionPlugin" */ '~shared/ui/text-editor/plugins/entity-mention-plugin'
  ).then((m) => ({
    default: m.TextEditorEntityMentionPlugin,
  }))
);

const ToolbarMenuPublisherOption = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarMenuPublisherOption" */ '~features/editor/attachments/ui/toolbar/block/entity-block-toolbar-menu-option'
  ).then((m) => ({
    default: m.ToolbarMenuPublisherOption,
  }))
);
const ToolbarMenuQuizOption = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarMenuQuizOption" */ '~features/editor/attachments/ui/toolbar/block/entity-block-toolbar-menu-option'
  ).then((m) => ({
    default: m.ToolbarMenuQuizOption,
  }))
);
const ToolbarMenuTitleOption = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarMenuTitleOption" */ '~features/editor/attachments/ui/toolbar/block/entity-block-toolbar-menu-option'
  ).then((m) => ({
    default: m.ToolbarMenuTitleOption,
  }))
);
const ToolbarMenuUserOption = lazy(() =>
  import(
    /* webpackChunkName: "ToolbarMenuUserOption" */ '~features/editor/attachments/ui/toolbar/block/entity-block-toolbar-menu-option'
  ).then((m) => ({
    default: m.ToolbarMenuUserOption,
  }))
);

const ToolbarItalic = lazy(() =>
  import(/* webpackChunkName: "ToolbarItalic" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarItalic,
  }))
);

const ToolbarBold = lazy(() =>
  import(/* webpackChunkName: "ToolbarBold" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarBold,
  }))
);

const ToolbarRoot = lazy(() =>
  import(/* webpackChunkName: "ToolbarRoot" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarRoot,
  }))
);

const ToolbarMenu = lazy(() =>
  import(/* webpackChunkName: "ToolbarMenu" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarMenu,
  }))
);

const ToolbarStrikethrough = lazy(() =>
  import(/* webpackChunkName: "ToolbarStrikethrough" */ '~shared/ui/text-editor/toolbar').then(
    (m) => ({ default: m.ToolbarStrikethrough })
  )
);
const ToolbarLink = lazy(() =>
  import(/* webpackChunkName: "ToolbarLink" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarLink,
  }))
);

const ToolbarMaxLength = lazy(() =>
  import(/* webpackChunkName: "ToolbarMaxLength" */ '~shared/ui/text-editor/toolbar').then((m) => ({
    default: m.ToolbarMaxLength,
  }))
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
const TextEditorContainer = lazy(() =>
  import(/* webpackChunkName: "TextEditorContainer" */ '~shared/ui/text-editor/text-editor').then(
    (m) => ({ default: m.TextEditorContainer })
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

const TextEditorLinkPlugin = lazy(() =>
  import(
    /* webpackChunkName: "TextEditorLinkPlugin" */ '~shared/ui/text-editor/plugins/link-plugin'
  ).then((m) => ({
    default: m.TextEditorLinkPlugin,
  }))
);

export interface FormEditorFieldProps {
  className?: string;
}
const ToolbarMenuMentionsToolbarMenu = () => {
  const tReusable = useTranslations('reusable');
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  return (
    <Suspense fallback="">
      <ToolbarMenu onOpenChange={setOpen} open={open} label={tReusable('actions.insert')}>
        <Suspense fallback="">
          <ToolbarMenuQuizOption onSuccess={close} />
        </Suspense>
        <Suspense fallback="">
          <ToolbarMenuUserOption onSuccess={close} />
        </Suspense>
        <Suspense fallback="">
          <ToolbarMenuPublisherOption onSuccess={close} />
        </Suspense>
        <Suspense fallback="">
          <ToolbarMenuTitleOption onSuccess={close} />
        </Suspense>
      </ToolbarMenu>
    </Suspense>
  );
};
export const FormEditorField = memo((props: FormEditorFieldProps) => {
  const { className } = props;

  const tForm = useTranslations('form');
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const {
    attachments,
    add: addAttachment,
    remove: removeAttachment,
  } = useStrictContext(PostAttachmentsContext);

  const session = useSession();
  const friendlyDomains = useFriendlyDomains();
  const permittedLinkDomains = session?.is_staff || session?.is_superuser ? null : friendlyDomains;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="border-border overflow-hidden rounded-md border p-2">
        <FormField
          control={control}
          name="header"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder={tForm('placeholders.title')}
                  className="border-0 focus-within:ring-0 focus-within:ring-offset-0"
                  inputClassName="p-1 !text-lg font-semibold"
                  type="text"
                />
              </FormControl>
              <FormMessage className="px-4" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="text"
          render={({ field }) => {
            return (
              <FormItem className="mt-2">
                <FormControl>
                  <EntityNodeViewProvider renderNode={entityResolver} models={attachments}>
                    <TextEditorRoot
                      maxLength={MAX_POST_LENGTH}
                      innerClassName="bg-transparent border-none"
                    >
                      <TextEditorContainer className="pt-0">
                        <TextEditorEditableArea
                          className="min-h-[12rem]"
                          placeholder={
                            <ReText
                              className="pointer-events-none absolute top-0 cursor-text text-sm opacity-50 select-none"
                              color="muted-foreground"
                            >
                              {tForm('placeholders.heres_content')}
                            </ReText>
                          }
                        />
                        <TextEditorMarkdownPlugin />
                        <TextEditorOnChangePlugin
                          onChange={(v) => {
                            field.onChange(v);
                          }}
                        />
                        <TextEditorDefaultValuePlugin defaultValue={field.value} />
                        <TextEditorAutoFocusPlugin />
                        <TextEditorEntityMentionPlugin
                          onAdd={({ type, model }) => {
                            addAttachment(type, model);
                          }}
                          onRemove={removeAttachment}
                        />
                        <TextEditorEntityBlockPlugin
                          onAdd={({ type, model }) => {
                            addAttachment(type, model);
                          }}
                          onRemove={removeAttachment}
                        />

                        <TextEditorLinkPlugin />
                      </TextEditorContainer>
                      <ToolbarRoot className="flex px-4 py-0">
                        <ToolbarBold />
                        <ToolbarItalic />
                        <ToolbarStrikethrough />
                        <ToolbarMentionButton />
                        <ToolbarLink permittedDomains={permittedLinkDomains} />
                        <ToolbarMenuMentionsToolbarMenu />

                        <div className="flex-1" />

                        <ToolbarMaxLength />
                        <ToolbarEntityMentionPopover />
                      </ToolbarRoot>
                    </TextEditorRoot>
                  </EntityNodeViewProvider>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <FormDescription className="text-muted-foreground">
        {tForm('labels.no-third-party-sources-label')}
      </FormDescription>
    </div>
  );
});
