import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@re/ui-kit/utils/cn';

import { useEventCallback } from '~shared/hooks/use-event-callback';
import { useMotionPreference } from '~shared/hooks/use-motion-preference';
import { useEvents } from '~shared/lib/lightbox/stores/events';
import { useTimeouts } from '~shared/lib/lightbox/stores/timeouts';

import { LightBoxRoot } from '../../components';
import { createModule } from '../../config';
import { ACTION_CLOSE, CLASS_NO_SCROLL_PADDING, MODULE_PORTAL } from '../../consts';
import { lightboxDefaultProps } from '../../props';
import { LightBoxComponentProps } from '../../types';
import { composePrefix, cssClass, cssVar } from '../../utils';

import classes from './classes.module.scss';

function cssPrefix(value?: string) {
  return composePrefix(MODULE_PORTAL, value);
}

function setAttribute(element: Element, attribute: string, value: string) {
  const previousValue = element.getAttribute(attribute);

  element.setAttribute(attribute, value);

  return () => {
    if (previousValue) {
      element.setAttribute(attribute, previousValue);
    } else {
      element.removeAttribute(attribute);
    }
  };
}

export function Portal({
  children,
  animation,
  styles,
  className,
  on,
  portal,
  close,
}: LightBoxComponentProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const cleanup = React.useRef<(() => void)[]>([]);
  const restoreFocus = React.useRef<Element>(null);

  const { setTimeout } = useTimeouts();
  const { subscribe } = useEvents();

  const reduceMotion = useMotionPreference();
  const animationDuration = !reduceMotion ? animation.fade : 0;

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
      setVisible(false);
    };
  }, []);

  const handleCleanup = useEventCallback(() => {
    cleanup.current.forEach((clean) => clean());
    cleanup.current = [];
  });

  const handleClose = useEventCallback(() => {
    setVisible(false);

    handleCleanup();

    on.exiting?.();

    setTimeout(() => {
      on.exited?.();

      close();
    }, animationDuration);
  });

  React.useEffect(() => subscribe(ACTION_CLOSE, handleClose), [subscribe, handleClose]);

  const handleEnter = useEventCallback((node: HTMLDivElement) => {
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    node.scrollTop;

    setVisible(true);

    on.entering?.();

    const elements = node.parentNode?.children ?? [];
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      if (!element) return;
      if (['TEMPLATE', 'SCRIPT', 'STYLE'].indexOf(element.tagName) === -1 && element !== node) {
        cleanup.current.push(setAttribute(element, 'inert', ''));
        cleanup.current.push(setAttribute(element, 'aria-hidden', 'true'));
      }
    }

    cleanup.current.push(() => {
      (restoreFocus.current as HTMLElement | null)?.focus?.();
    });

    setTimeout(() => {
      on.entered?.();
    }, animationDuration);
  });

  const handleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        handleEnter(node);
      } else {
        handleCleanup();
      }
    },
    [handleEnter, handleCleanup]
  );
  return mounted
    ? createPortal(
        <LightBoxRoot
          ref={handleRef}
          className={cn(
            className,
            classes.portal,
            visible && classes.open,
            // just markers
            cssClass(cssPrefix()),
            cssClass(CLASS_NO_SCROLL_PADDING)
          )}
          aria-modal
          role="dialog"
          aria-live="polite"
          aria-roledescription="lightbox"
          style={{
            ...(animation.fade !== lightboxDefaultProps.animation.fade
              ? { [cssVar('fade_animation_duration')]: `${animationDuration}ms` }
              : null),
            ...(animation.easing.fade !== lightboxDefaultProps.animation.easing.fade
              ? { [cssVar('fade_animation_timing_function')]: animation.easing.fade }
              : null),
            ...styles.root,
          }}
          onFocus={(event) => {
            if (!restoreFocus.current) {
              restoreFocus.current = event.relatedTarget;
            }
          }}
        >
          {children}
        </LightBoxRoot>,
        portal.root || document.body
      )
    : null;
}

export const PortalModule = createModule(MODULE_PORTAL, Portal);
