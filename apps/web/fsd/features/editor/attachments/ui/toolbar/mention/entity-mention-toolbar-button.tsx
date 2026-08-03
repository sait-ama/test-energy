import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { AtIcon } from '@re/ui-kit/icons/at';

import { CUSTOM_CREATE_MENTION } from '~shared/ui/text-editor/commands';
import { ToolbarButton } from '~shared/ui/text-editor/toolbar';

export const ToolbarMentionButton = () => {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.dispatchCommand(CUSTOM_CREATE_MENTION, { type: '', replaceNode: null });
  };

  return <ToolbarButton onClick={handleClick} isActive={false} icon={AtIcon} />;
};
