import { useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { CUSTOM_LINK_CLICK_COMMAND } from '../commands';

export function TextEditorLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && editor.getRootElement()?.contains(link)) {
        e.preventDefault();
        editor.dispatchCommand(CUSTOM_LINK_CLICK_COMMAND, link.getAttribute('href') || '');
      }
    };

    document.addEventListener('click', handler, true);

    return () => {
      document.removeEventListener('click', handler, true);
    };
  }, [editor]);

  return <LexicalLinkPlugin />;
}
