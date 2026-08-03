import * as React from 'react';

import { useContainerRect } from '~shared/hooks/use-container-rect';
import { useIsomorphicEffect } from '~shared/hooks/use-isomorphic-effect';

import { CloseIcon, IconButton } from '../components';
import { createModule } from '../config';
import { ACTION_CLOSE, MODULE_TOOLBAR } from '../consts';
import { LightBoxComponentProps } from '../types';
import { useController } from './controller/store';

import classes from '../classes.module.scss';

export function Toolbar({
  toolbar: { buttons },
  render: { buttonClose, iconClose },
  styles,
}: LightBoxComponentProps) {
  const { close, setToolbarWidth } = useController();
  const { setContainerRef, containerRect } = useContainerRect();

  useIsomorphicEffect(() => {
    setToolbarWidth(containerRect?.width);
  }, [setToolbarWidth, containerRect?.width]);

  const renderCloseButton = () => {
    if (buttonClose) return buttonClose();

    return (
      <IconButton
        key={ACTION_CLOSE}
        label="Close"
        icon={CloseIcon}
        renderIcon={iconClose}
        onClick={close}
      />
    );
  };

  return (
    <div ref={setContainerRef} style={styles.toolbar} className={classes.toolbar}>
      {buttons?.map((button) => (button === ACTION_CLOSE ? renderCloseButton() : button))}
    </div>
  );
}

export const ToolbarModule = createModule(MODULE_TOOLBAR, Toolbar);
