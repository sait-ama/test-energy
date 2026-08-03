'use client';

import { useEffect } from 'react';

import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';

import { decodeHtml } from '~shared/utils/decode-html';

export const TextEditorControlledValuePlugin = ({
  triggerKey,
  value,
}: {
  triggerKey?: string;
  value?: string;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!value || !triggerKey) return;

    editor.update(() => {
      const decoded = decodeHtml(value);
      const parser = new DOMParser();
      const dom = parser.parseFromString(decoded, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
  }, [triggerKey]);

  return null;
};
