'use client';

import { ComponentPropsWithoutRef, JSX, ReactNode, useEffect, useState } from 'react';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  KEY_ENTER_COMMAND,
  LexicalEditor,
  TextNode,
} from 'lexical';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { logger } from '~shared/lib/logger';
import {
  $createStickerNode,
  StickerNode,
} from '~shared/ui/text-editor/nodes/sticker-node/sticker-node';

import { EntityBlockNode } from './nodes/entity-block-node';
import { EntityMentionNode } from './nodes/entity-mention-node';
import { ToolbarProvider } from './toolbar';

export const TextEditorRoot = (props: {
  children: ReactNode;
  className?: string;
  maxLength?: number;
  innerClassName?: string;
}) => {
  const { children, className, maxLength, innerClassName } = props;

  const editorConfig = {
    namespace: 'lexical-editor',
    theme: {
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal',
        ul: 'list-disc',
      },
      text: {
        bold: 'font-semibold',
        underline: 'underline',
        italic: 'italic',
        strikethrough: 'line-through',
        underlineStrikethrough: 'underlined-line-through',
        //     todo add h1, h2
      },
      heading: {
        h1: 'text-2xl',
        h2: 'text-xl',
      },
      link: 'text-primary underline cursor-pointer',
    },

    onError: (error) => {
      logger.error(error);
    },
    nodes: [
      TextNode,
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
      StickerNode,
      SpoilerNode,
      EntityBlockNode,
      EntityMentionNode,
    ],
  } satisfies InitialConfigType;

  return (
    <div
      className={
        (cn(
          `prose-sm prose-slate`,
          `prose-headings:mt-0 prose-headings:mb-1 prose-p:m-0`,
          `prose-ul:m-0 prose-ul:pl-5 prose-li:m-0 prose-li:p-0`,
          `prose-ol:m-0 prose-ol:pl-5 prose-li:m-0 prose-li:p-0`,
          `prose-blockquote:m-0 prose-blockquote:ml-1 prose-blockquote:pl-2 prose-blockquote:border-gray-300 prose-blockquote:border-l-4`,
          `prose-code:bg-gray-100 prose-code:p-1`,
          `prose-a:text-blue-500 text-red`
        ),
        className)
      }
    >
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarProvider value={{ maxLength }}>
          <div className={cn('border-border flex flex-col rounded-sm border', innerClassName)}>
            {children}
          </div>
        </ToolbarProvider>
      </LexicalComposer>
    </div>
  );
};

interface SerializedSpoilerNode {
  type: string;
  version: number;
  text: string;
  key: string;
}

class SpoilerNode extends DecoratorNode<JSX.Element> {
  __text: string;

  constructor(text = '', key?: string) {
    super(key);
    this.__text = text;
  }

  static getType(): string {
    return 'spoiler';
  }

  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedSpoilerNode): SpoilerNode {
    return $createSpoilerNode(serializedNode.text);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      // @ts-ignore
      span: (node: Node) => {
        const element = node as HTMLElement;
        if (element.classList.contains('spoiler')) {
          return {
            conversion: (domNode: Node) => {
              const text = domNode.textContent || '';
              return new SpoilerNode(text);
            },
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  static fromJSON(serializedNode: SerializedSpoilerNode): SpoilerNode {
    return new SpoilerNode(serializedNode.text, serializedNode.key);
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'spoiler';
    return span;
  }

  exportJSON(): SerializedSpoilerNode {
    return {
      type: SpoilerNode.getType(),
      version: 1,
      text: this.__text,
      key: this.__key,
    };
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <span className="spoiler">[spoiler]{this.__text}[/spoiler]</span>;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('span');
    element.className = 'spoiler';
    element.textContent = this.__text;
    return { element };
  }
}

export function $createSpoilerNode(text: string): SpoilerNode {
  return new SpoilerNode(text);
}

export const SPOILER_COMMAND = createCommand('SPOILER_COMMAND');
export const STICKER_COMMAND = createCommand<{
  src: string;
  is_emoji: boolean;
  shopItemDir: string;
}>('EMOJI_COMMAND');

export function hasSignificantContent(editor: LexicalEditor): boolean {
  let hasContent = false;

  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    for (const child of children) {
      if ($isTextNode(child)) {
        const text = child.getTextContent().trim();
        if (text.length > 0) {
          hasContent = true;
          break;
        }
      } else if ($isElementNode(child)) {
        const children = child.getChildren();
        for (const grandChild of children) {
          if ($isTextNode(grandChild)) {
            const text = grandChild.getTextContent().trim();
            if (text.length > 0) {
              hasContent = true;
              break;
            }
          } else if (grandChild.getType() === 'sticker' || grandChild.getType() === 'image') {
            hasContent = true;
            break;
          }
        }
      }
    }
  });

  return hasContent;
}

export const ContentTrackerPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const hasContent = hasSignificantContent(editor);
      //todo implement
      console.log('Has significant content:', hasContent);
    });
  }, [editor]);

  return null;
};

export const TextEditorHotKeyPlugin = ({ onSubmit }: { onSubmit: (/*text: string*/) => void }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent) => {
        const isShiftEnter = event.shiftKey;

        if (!isShiftEnter) {
          event.preventDefault();
          editor.update(() => {
            // const textContent = $getRoot().getTextContent();
            onSubmit(/*textContent*/);
          });
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, onSubmit]);

  useEffect(() => {
    const handleMobileEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        editor.update(() => {
          // const textContent = $getRoot().getTextContent();
          onSubmit();
        });
      }
    };

    const rootElement = editor.getRootElement();
    rootElement?.addEventListener('keypress', handleMobileEnter);

    return () => {
      rootElement?.removeEventListener('keypress', handleMobileEnter);
    };
  }, [editor, onSubmit]);

  return null;
};
export type OnPickSingleHandler<T> = (element: HTMLElement, context?: T) => void;
export type TextEditorStickerPluginProps<T> = {
  context?: T;
  alwaysSendAsEmoji?: boolean;
  sendSticker?: OnPickSingleHandler<T>;
};
//when alwaysSendAsEmoji=true, send all of stickers as emojis, else -> check is_emoji, is_emoji=false->send emoji as single message
export const TextEditorStickerPlugin = <T,>({
  alwaysSendAsEmoji = false,
  sendSticker,
  context,
}: TextEditorStickerPluginProps<T>) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const nodes = selection.getNodes();
            nodes.forEach((node) => {
              if (node.getType() === 'sticker') {
                node.remove();
              }
            });
          }
        });
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (rootElement) {
        rootElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand<{
      src: string;
      is_emoji: boolean;
      shopItemDir: string;
      shopId: number;
    }>(
      STICKER_COMMAND,
      (payload) => {
        const { src, is_emoji, shopItemDir } = payload;
        if (!src) return true;

        const sendSingleSticker = !(payload.is_emoji || alwaysSendAsEmoji);
        if (sendSingleSticker) {
          const stickerNode = $createStickerNode({
            src,
            is_emoji,
            is_single: true,
            shopItemDir,
            altText: 'sticker',
          });
          const stickerHtml = stickerNode.exportDOM().element as HTMLElement;
          if (context) {
            sendSticker?.(stickerHtml, context);
          } else {
            sendSticker?.(stickerHtml);
          }

          return true;
        }

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          editor.update(() => {
            const stickerNode = $createStickerNode({
              src,
              is_emoji,
              is_single: false,
              shopItemDir,
              altText: 'sticker',
            });
            selection.insertNodes([stickerNode]);
          });
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
};

export const TextEditorSpoilerPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeCommand = editor.registerCommand(
      SPOILER_COMMAND,
      () => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const selectedText = selection.getTextContent();

            if (selectedText.trim() === '') {
              return;
            }

            const spoilerNode = $createSpoilerNode(selectedText);

            selection.insertNodes([spoilerNode]);

            selection.removeText();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      removeCommand();
    };
  }, [editor]);

  return null;
};
export const TextEditorContainer = ({
  className,
  children,
  ...other
}: {
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('relative p-4', className)} {...other}>
    {children}
  </div>
);

export const TextEditorEditableArea = (props: ComponentPropsWithoutRef<typeof ContentEditable>) => {
  const { placeholder, className, autoFocus = true, ...rest } = props;

  return (
    <RichTextPlugin
      contentEditable={
        <ContentEditable
          {...rest}
          autoFocus={autoFocus}
          className={cn('testing min-h-[3rem] focus:outline-hidden', className)}
          placeholder={
            typeof placeholder === 'object' ? (
              placeholder
            ) : (
              <ReText size="xs" color="muted-foreground" component="span">
                {placeholder}
              </ReText>
            )
          }
        />
      }
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
};
export const EMOJI_COMMAND = createCommand<'EMOJI'>('EMOJI');

export const TypingIndicatorPlugin = ({
  onTypingChange,
}: {
  onTypingChange?: (typing: boolean) => void;
}) => {
  const [editor] = useLexicalComposerContext();
  const [state, setState] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();

        const hasContent = !!root.getTextContent().length;

        if (hasContent) {
          if (!state) {
            setState(true);
            onTypingChange?.(true);
          }
        } else {
          if (state) {
            setState(false);
            onTypingChange?.(false);
          }
        }
      });
    });

    return () => {
      unregisterListener();
    };
  }, [editor, state]);
};
export const TextEditorEmojiPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand<{ emoji: string }>(
        EMOJI_COMMAND,
        (payload) => {
          editor.focus();
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const { emoji: src } = payload;
            editor.update(() => {
              selection.insertText(src);
            });
          }
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
    [editor]
  );

  return null;
};
