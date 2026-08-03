'use client';

import { useEffect, useRef } from 'react';

import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';

import { decodeHtml } from '~shared/utils/decode-html';

export const TextEditorDefaultValuePlugin = ({ defaultValue }: { defaultValue?: string }) => {
  const [editor] = useLexicalComposerContext();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!defaultValue || !isFirstRun.current) return;
    isFirstRun.current = false;

    editor.update(() => {
      const decoded = decodeHtml(defaultValue);
      const parser = new DOMParser();
      const dom = parser.parseFromString(decoded, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
  }, []);

  return null;
};
