import { useEffect, useRef } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';

import {
  CUSTOM_CREATE_MENTION,
  CUSTOM_CREATE_MENTION_NODE,
  CUSTOM_REMOVE_MENTION_NODE,
} from '../commands';
import { EntityMentionNode } from '../nodes/entity-mention-node';
import { removeCurrentWord } from '../utils/remove-current-word';

export interface TextEditorEntityMentionPluginProps {
  onAdd?: (opts: { type: string; id: string; model: any }) => void;
  onRemove?: (opts: { type: string; id: string }) => void;
}

export function TextEditorEntityMentionPlugin({
  onAdd,
  onRemove,
}: TextEditorEntityMentionPluginProps) {
  const [editor] = useLexicalComposerContext();
  const lastTriggeredWord = useRef<string | null>(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            editor.dispatchCommand(CUSTOM_CREATE_MENTION, null);
            return;
          }

          const anchor = selection.anchor;
          const node = anchor.getNode();

          if (!$isTextNode(node)) {
            editor.dispatchCommand(CUSTOM_CREATE_MENTION, null);
            return;
          }

          const text = node.getTextContent();
          const offset = anchor.offset;

          // Последнее введённое слово
          const beforeCursor = text.slice(0, offset);
          const match = /(?:^|\s)(@\w*)$/.exec(beforeCursor);

          if (!match) {
            lastTriggeredWord.current = null;
            editor.dispatchCommand(CUSTOM_CREATE_MENTION, null);
            return;
          }

          const fullMatch = match[1]; // например: "@", "@card"
          if (
            lastTriggeredWord.current &&
            lastTriggeredWord.current.length > 1 &&
            lastTriggeredWord.current === fullMatch
          ) {
            editor.dispatchCommand(CUSTOM_CREATE_MENTION, null);
            return;
          }

          lastTriggeredWord.current = fullMatch;

          if (fullMatch === '@') {
            editor.dispatchCommand(CUSTOM_CREATE_MENTION, { type: '', replaceNode: node });
            return;
          }

          if (fullMatch.length > 1) {
            const tag = fullMatch.slice(1); // убираем @ → "card"

            editor.dispatchCommand(CUSTOM_CREATE_MENTION, { type: tag, replaceNode: node });
            return;
          }

          editor.dispatchCommand(CUSTOM_CREATE_MENTION, null);
        });
      }),
      editor.registerCommand(
        CUSTOM_CREATE_MENTION_NODE,
        ({ id, type, replaceNode, model }) => {
          editor.update(() => {
            const node = new EntityMentionNode({ entity: type, entityId: id, model });

            if (replaceNode) {
              removeCurrentWord();
            }

            onAdd?.({ type, id, model });

            $insertNodes([node]);
          });

          return false;
        },
        0
      ),
      editor.registerCommand(
        CUSTOM_REMOVE_MENTION_NODE,
        ({ key, type, id }) => {
          editor.update(() => {
            const node = $getNodeByKey(key);
            onRemove?.({ type, id });

            node?.remove();
          });
          return false;
        },
        0
      )
    );
  }, [editor]);

  return null;
}
