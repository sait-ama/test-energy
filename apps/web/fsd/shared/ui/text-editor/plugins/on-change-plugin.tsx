import { $generateHtmlFromNodes } from '@lexical/html';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import type { EditorState } from 'lexical';
import { type LexicalEditor } from 'lexical';

export const TextEditorOnChangePlugin = (props: { onChange: (html: string) => void }) => {
  const { onChange } = props;

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      onChange(html);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
};
