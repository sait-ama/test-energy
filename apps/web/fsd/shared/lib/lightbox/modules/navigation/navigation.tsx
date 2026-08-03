import * as React from 'react';

import { useLoseFocus } from '~shared/hooks/use-lose-focus';
import { createModule } from '~shared/lib/lightbox/config';

import { IconButton, NextIcon, PreviousIcon } from '../../components';
import { ACTION_NEXT, ACTION_PREV, MODULE_NAVIGATION } from '../../consts';
import { Label, LightBoxComponentProps, RenderFunction } from '../../types';
import { useController } from '../controller/store';
import { useKeyboardNavigation } from './use-keyboard-navigation';
import { useNavigationState } from './use-navigation-state';

import classes from './classes.module.scss';

export type NavigationButtonProps = {
  label: Label;
  icon: React.ElementType;
  renderIcon?: RenderFunction;
  action: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export function NavigationButton({
  label,
  icon,
  renderIcon,
  action,
  onClick,
  disabled,
  style,
}: NavigationButtonProps) {
  return (
    <IconButton
      label={label}
      icon={icon}
      renderIcon={renderIcon}
      className={classes[action]}
      // className={cssClass(`navigation_${action}`)}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...useLoseFocus(useController().focus, disabled)}
    />
  );
}

export function Navigation({
  render: { buttonPrev, buttonNext, iconPrev, iconNext },
  styles,
}: LightBoxComponentProps) {
  const { prev, next, subscribeSensors } = useController();
  const { prevDisabled, nextDisabled } = useNavigationState();

  useKeyboardNavigation(subscribeSensors);

  return (
    <>
      {buttonPrev ? (
        buttonPrev()
      ) : (
        <NavigationButton
          label="Previous"
          action={ACTION_PREV}
          icon={PreviousIcon}
          renderIcon={iconPrev}
          style={styles.navigationPrev}
          disabled={prevDisabled}
          onClick={prev}
        />
      )}

      {buttonNext ? (
        buttonNext()
      ) : (
        <NavigationButton
          label="Next"
          action={ACTION_NEXT}
          icon={NextIcon}
          renderIcon={iconNext}
          style={styles.navigationNext}
          disabled={nextDisabled}
          onClick={next}
        />
      )}
    </>
  );
}

export const NavigationModule = createModule(MODULE_NAVIGATION, Navigation);
