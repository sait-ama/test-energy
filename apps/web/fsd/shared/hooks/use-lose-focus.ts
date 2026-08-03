import * as React from 'react';

import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';

/**
 * Manages focus state with automatic recovery.
 * Perfect for modals and temporary UI elements.
 *  const Modal = ({ onClose }) => {
 * const { onFocus, onBlur } = useLoseFocus(() => {
 *    onClose();
 *  });
 *
 * return (
 *    <div
 *      tabIndex={-1}
 *      onFocus={onFocus}
 *      onBlur={onBlur}
 *    >
 *      Modal content
 *    </div>
 *  );
 * };


 */
export function useLoseFocus(focus: () => void, disabled = false) {
  const focused = React.useRef(false);

  useIsomorphicEffect(() => {
    if (disabled && focused.current) {
      focused.current = false;
      focus();
    }
  }, [disabled, focus]);

  const onFocus = React.useCallback(() => {
    focused.current = true;
  }, []);

  const onBlur = React.useCallback(() => {
    focused.current = false;
  }, []);

  return { onFocus, onBlur };
}
