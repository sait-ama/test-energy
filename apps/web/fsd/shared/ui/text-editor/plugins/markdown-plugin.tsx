import { TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

export const TextEditorMarkdownPlugin = () => (
  <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
);
