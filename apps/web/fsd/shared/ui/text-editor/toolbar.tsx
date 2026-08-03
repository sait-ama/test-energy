'use client';
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  Dispatch,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';

import { $generateHtmlFromNodes } from '@lexical/html';
import { $isLinkNode, LinkNode, toggleLink } from '@lexical/link';
import { $isListNode, insertList, ListNode, type ListType } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { HeadingTagType } from '@lexical/rich-text';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text';
import { $isAtNodeEnd, $setBlocksType } from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { createContextSelector } from '@re/core/utils/create-context-selector';
import BoldIcon from '@re/ui-kit/icons/bold';
import BulletListIcon from '@re/ui-kit/icons/bullet-list';
import { CheckIcon } from '@re/ui-kit/icons/check';
import CodeIcon from '@re/ui-kit/icons/code';
import H1Icon from '@re/ui-kit/icons/h1';
import H2Icon from '@re/ui-kit/icons/h2';
import ItalicIcon from '@re/ui-kit/icons/italic';
import LinkIcon from '@re/ui-kit/icons/link';
import QuoteIcon from '@re/ui-kit/icons/quote';
import RedoIcon from '@re/ui-kit/icons/redo';
import StrikethroughIcon from '@re/ui-kit/icons/strikethrough';
import { TrashIcon } from '@re/ui-kit/icons/trash';
import UndoIcon from '@re/ui-kit/icons/undo';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { Icon } from '@re/ui-kit/ui/icon';
import { Popover, PopoverAnchor, PopoverContent } from '@re/ui-kit/ui/popover';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import type { ElementNode, LexicalEditor, LexicalNode, RangeSelection, TextNode } from 'lexical';
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { Input } from '~shared/ui/input';
import { SPOILER_COMMAND } from '~shared/ui/text-editor/text-editor';
import { validateUrlDomain } from '~shared/utils/validate-url';

import { importToastAsync } from '../toast/toast.async';

import { CUSTOM_LINK_CLICK_COMMAND } from './commands';

export function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const { anchor } = selection;
  const { focus } = selection;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

export interface ToolbarButtonProps {
  isActive?: boolean;
  disabled?: boolean;
  icon: typeof Icon;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  asChild?: boolean;
}

export const ToolbarButton = ({
  isActive,
  disabled,
  onClick,
  icon: Icon,
  asChild,
}: ToolbarButtonProps) => (
  <Button
    asChild={asChild}
    variant={isActive ? 'default' : 'ghost'}
    size="sm"
    circle
    type="button"
    onClick={onClick}
    disabled={disabled}
  >
    <Icon size={18} />
  </Button>
);

export interface ToolbarMenuProps extends ComponentProps<typeof DropdownMenu> {
  children: ReactNode;
  label: ReactNode;
  className?: string;
}

export const ToolbarMenu = ({ label, children, className, ...rest }: ToolbarMenuProps) => {
  return (
    <DropdownMenu {...rest}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className={cn('w-20 flex-[0_1_auto]', className)}
          color="secondary"
          circle
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};

export interface ToolbarMenuOptionProps extends ComponentPropsWithoutRef<typeof DropdownMenuItem> {
  children: ReactNode;
}

export const ToolbarMenuOption = ({ children, ...rest }: ToolbarMenuOptionProps) => {
  return <DropdownMenuItem {...rest}>{children}</DropdownMenuItem>;
};
interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isStrikethrough: boolean;
  isLink: boolean;
  isHeading1: boolean;
  isSpoiler: boolean;
  isHeading2: boolean;
  isQuote: boolean;
  isCode: boolean;
  isBulletList: boolean;
  isNumberList: boolean;
  canUndo: boolean;
  canRedo: boolean;
  formatLink: (url: string | null) => void;
  formatList: (type: ListType) => void;
  formatQuote: () => void;
  formatParagraph: () => void;
  formatHeading: (headingSize: HeadingTagType) => void;
  setLinkUrl: Dispatch<SetStateAction<string | null>>;
  linkUrl: string | null;
  maxLength: number;
}

// @ts-ignore
const { Provider: ToolbarProvider, useStore: useToolbar } = createContextSelector<
  ToolbarState,
  {
    maxLength?: number;
  }
>(({ maxLength = 10000 }) => {
  const [editor] = useLexicalComposerContext();
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [toolbarState, setToolbarState] = useState({
    isBold: false,
    isItalic: false,
    isStrikethrough: false,
    isLink: false,
    isHeading1: false,
    isSticker: false,
    isSpoiler: false,
    isHeading2: false,
    isQuote: false,
    isCode: false,
    isBulletList: false,
    isNumberList: false,
    canUndo: false,
    canSendSticker: false,
    canRedo: false,
    maxLength,
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      const isLinkType = (node: LexicalNode | null): node is LinkNode => {
        return !!node && 'getURL' in node && typeof node?.getURL === 'function';
      };
      const isNodeLink = isLinkType(node);
      const isParentLink = isLinkType(parent);

      setLinkUrl(() => {
        if (!isLink) return null;
        if (isParentLink) return parent?.getURL?.();
        if (isNodeLink) return node?.getURL?.();
        return null;
      });

      setToolbarState((state) => ({
        ...state,
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isLink,
        isHeading1: $isHeadingNode(element) && element.getTag() === 'h1',
        isHeading2: $isHeadingNode(element) && element.getTag() === 'h2',
        isQuote: $isQuoteNode(element),
        isCode: selection.hasFormat('code'),
        isBulletList:
          $isListNode(element) &&
          $getNearestNodeOfType<ListNode>(element, ListNode)?.getListType() === 'bullet',
        isNumberList:
          $isListNode(element) &&
          $getNearestNodeOfType<ListNode>(element, ListNode)?.getListType() === 'number',
      }));
    }
  }, []);

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            updateToolbar();
          });
        }),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          (payload) => {
            setToolbarState((state) => ({
              ...state,
              canUndo: payload,
            }));
            return false;
          },
          COMMAND_PRIORITY_CRITICAL
        ),

        editor.registerCommand(
          CAN_REDO_COMMAND,
          (payload) => {
            setToolbarState((state) => ({
              ...state,
              canRedo: payload,
            }));
            return false;
          },
          COMMAND_PRIORITY_CRITICAL
        )
      ),
    [editor, updateToolbar]
  );

  function formatHeading(headingSize: HeadingTagType) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  }

  function formatParagraph() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  function formatQuote() {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }

  function formatList(type: ListType) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        insertList(editor, type);
      }
    });
  }

  function formatLink(url: string | null) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        toggleLink(url);
      }
    });
  }

  return {
    ...toolbarState,
    linkUrl,
    setLinkUrl,
    formatLink,
    formatList,
    formatQuote,
    formatParagraph,
    formatHeading,
  };
});

export const ToolbarRoot = ({ children, className }: HTMLAttributes<HTMLDivElement>) => (
  <ScrollArea>
    <div className={cn('flex flex-wrap gap-1 rounded-md p-1.5', className)}>{children}</div>
  </ScrollArea>
);

export interface ToolbarLinkProps {
  permittedDomains?: readonly string[] | null;
}

export const ToolbarLink = ({ permittedDomains }: ToolbarLinkProps) => {
  const { setLinkUrl, linkUrl, isLink, formatLink } = useToolbar((v) => v);
  const t = useTranslations('lexical-editor.toolbar-link');

  const [isEditingLink, setIsEditingLink] = useState(false);
  // const [showAllDomains, setShowAllDomains] = useState(false);

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      CUSTOM_LINK_CLICK_COMMAND,
      () => {
        setIsEditingLink(true);
        return false;
      },
      0
    );
  }, [editor]);

  const handleSaveLink = async () => {
    let isValid = true;

    if (permittedDomains && linkUrl) {
      isValid = validateUrlDomain(linkUrl, permittedDomains);
    }

    if (!isValid) {
      const toast = await importToastAsync();
      toast.error(t('domain-error-message'));
      return;
    }

    formatLink(linkUrl);

    setIsEditingLink(false);
  };

  const handleRemoveLink = () => {
    formatLink(null);
    setIsEditingLink(false);
  };

  return (
    <>
      <ToolbarButton
        onClick={() => {
          setIsEditingLink((value) => !value);
        }}
        isActive={isLink}
        icon={LinkIcon}
      />
      <Popover open={isEditingLink} onOpenChange={setIsEditingLink}>
        <PopoverAnchor>
          <div className="absolute top-0 left-0" />
        </PopoverAnchor>
        <PopoverContent align="start" className="w-[22rem] md:w-[32rem]">
          <div className="flex space-x-2">
            <Input
              autoFocus
              value={linkUrl ?? 'https://'}
              onChange={(e) => {
                setLinkUrl(e.target.value);
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveLink}
                type="button"
                color="primary"
                circle
                size="sm"
                className="p-1"
              >
                <CheckIcon className="size-4" />
              </Button>
              <Button onClick={handleRemoveLink} color="danger" circle size="sm" className="p-1">
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>
          {/* {permittedDomains ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {permittedDomains.slice(0, showAllDomains ? permittedDomains.length : 5).map((it) => (
                <button
                  key={it}
                  onClick={() => setLinkUrl(`https://${it}`)}
                  className={cn(
                    badgeVariants({ variant: 'ghost' }),
                    'hover:text-primary flex items-center gap-0.5 text-sm font-medium transition-colors'
                  )}
                >
                  {it}
                </button>
              ))}
              {permittedDomains.length > 5 ? (
                <ReText
                  className="text-primary"
                  asChild
                  onClick={() => setShowAllDomains((v) => !v)}
                  size="sm"
                >
                  <button>{showAllDomains ? 'скрыть' : 'больше'}</button>
                </ReText>
              ) : null}
            </div>
          ) : null} */}
        </PopoverContent>
      </Popover>
    </>
  );
};

interface TextEditorActionProps {
  children: (editor: LexicalEditor) => ReactNode;
}

export const TextEditorAction = ({ children }: TextEditorActionProps & { asChild?: boolean }) => {
  const [editor] = useLexicalComposerContext();
  return children(editor);
};

interface TextEditorClearableProps {
  children: (clear: () => void) => ReactNode;
}

export const TextEditorClearable = ({ children }: TextEditorClearableProps) => {
  const clear = useCallback((editor: LexicalEditor) => {
    editor.update(() => {
      $getRoot().clear();
    });
  }, []);
  return (
    <TextEditorAction>
      {(editor) => {
        return children(() => clear(editor));
      }}
    </TextEditorAction>
  );
};
export const ToolbarBold = () => {
  const [editor] = useLexicalComposerContext();

  const { isBold } = useToolbar((v) => v);
  return (
    <ToolbarButton
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      isActive={isBold}
      icon={BoldIcon}
    />
  );
};

export const ToolbarMaxLength = () => {
  const [editor] = useLexicalComposerContext();
  const [length, setLength] = useState<number>(0);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        // html = html.replace(/<renode[^>]*>.*?<\/renode>/g, ''); ??

        setLength(html.replace(htmlRegExp, '').length);
      });
    });
  }, [editor]);

  const maxLength = useToolbar((v) => v.maxLength);

  return (
    <ReText
      align="center"
      className="flex h-[30px] items-center"
      size="xs"
      color="muted-foreground"
    >
      {length}/{maxLength}
    </ReText>
  );
};

export const ToolbarItalic = () => {
  const [editor] = useLexicalComposerContext();
  const { isItalic } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      isActive={isItalic}
      icon={ItalicIcon}
    />
  );
};

export const ToolbarStrikethrough = () => {
  const [editor] = useLexicalComposerContext();
  const { isStrikethrough } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
      isActive={isStrikethrough}
      icon={StrikethroughIcon}
    />
  );
};

export const ToolbarH1 = () => {
  const { isHeading1, formatHeading, formatParagraph } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        isHeading1 ? formatParagraph() : formatHeading('h1');
      }}
      isActive={isHeading1}
      icon={H1Icon}
    />
  );
};

export const ToolbarH2 = () => {
  const { isHeading2, formatHeading, formatParagraph } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        isHeading2 ? formatParagraph() : formatHeading('h1');
      }}
      isActive={isHeading2}
      icon={H2Icon}
    />
  );
};

export const ToolbarQuote = () => {
  const { isQuote, formatParagraph, formatQuote } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        isQuote ? formatParagraph() : formatQuote();
      }}
      isActive={isQuote}
      icon={QuoteIcon}
    />
  );
};

export const ToolbarCode = () => {
  const [editor] = useLexicalComposerContext();
  const { isCode } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
      isActive={isCode}
      icon={CodeIcon}
    />
  );
};

export const ToolbarBulletList = () => {
  const { isBulletList, formatParagraph, formatList } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        isBulletList ? formatParagraph() : formatList('bullet');
      }}
      isActive={isBulletList}
      icon={BulletListIcon}
    />
  );
};

export const ToolbarSpoiler = () => {
  const [editor] = useLexicalComposerContext();
  const { isSpoiler } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => editor.dispatchCommand(SPOILER_COMMAND, undefined)}
      isActive={isSpoiler}
      icon={() => 'S'}
    />
  );
};

export const ToolbarUndo = () => {
  const [editor] = useLexicalComposerContext();
  const { canUndo } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      disabled={!canUndo}
      icon={UndoIcon}
    />
  );
};

export const ToolbarRedo = () => {
  const [editor] = useLexicalComposerContext();
  const { canRedo } = useToolbar((v) => v);

  return (
    <ToolbarButton
      onClick={() => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
      }}
      disabled={!canRedo}
      icon={RedoIcon}
    />
  );
};

export { ToolbarProvider };
