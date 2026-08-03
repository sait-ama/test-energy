import { useEffect, useState } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { useHotkeyLock } from '~shared/lib/hotkey/hotkey-lock';

// todo: change impl of hotkeys to support hotkeys contexts
export const TextEditorHotkeyLockPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const checkInitialFocus = () => {
      const isElementFocused = rootElement.contains(document.activeElement);
      if (isElementFocused) {
        setIsFocused(true);
      }
    };

    checkInitialFocus();

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    rootElement.addEventListener('focus', handleFocus, true);
    rootElement.addEventListener('blur', handleBlur, true);

    return () => {
      rootElement.removeEventListener('focus', handleFocus, true);
      rootElement.removeEventListener('blur', handleBlur, true);
    };
  }, [editor]);

  useHotkeyLock({ shouldLock: isFocused });

  return null;
};
