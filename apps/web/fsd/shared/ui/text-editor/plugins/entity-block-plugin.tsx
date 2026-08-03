import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getNodeByKey, $insertNodes } from 'lexical';

import { CUSTOM_CREATE_BLOCK_NODE, CUSTOM_REMOVE_BLOCK_NODE } from '../commands';
import { EntityBlockNode } from '../nodes/entity-block-node';
import { removeCurrentWord } from '../utils/remove-current-word';

export interface TextEditorEntityBlockPluginProps {
  onAdd?: (opts: { type: string; id: string; model: any }) => void;
  onRemove?: (opts: { type: string; id: string }) => void;
}

export const TextEditorEntityBlockPlugin = ({
  onAdd,
  onRemove,
}: TextEditorEntityBlockPluginProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      CUSTOM_CREATE_BLOCK_NODE,
      ({ id, type, replaceNode, model }) => {
        editor.update(() => {
          const node = new EntityBlockNode({ entity: type, entityId: id, model });

          if (replaceNode) {
            removeCurrentWord();
          }

          onAdd?.({ type, id, model });

          $insertNodes([node, $createParagraphNode()]);
        });

        return false;
      },
      0
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CUSTOM_REMOVE_BLOCK_NODE,
      ({ key, type, id }) => {
        editor.update(() => {
          const node = $getNodeByKey(key);
          onRemove?.({ type, id });

          node?.remove();
        });
        return false;
      },
      0
    );
  }, [editor]);

  return null;
};
