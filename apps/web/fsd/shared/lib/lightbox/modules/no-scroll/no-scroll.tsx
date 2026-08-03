import * as React from 'react';

import { useRtl } from '~shared/hooks/use-rtl';
import { useDocumentContext } from '~shared/lib/lightbox/stores/document-store';

import { createModule } from '../../config';
import { CLASS_NO_SCROLL_PADDING, MODULE_NO_SCROLL } from '../../consts';
import { LightBoxComponentProps } from '../../types';
import { cssClass } from '../../utils';

import classes from './classes.module.css';

const noScroll = classes.noScroll!;
// just marker
const noScrollPadding = cssClass(CLASS_NO_SCROLL_PADDING);

function isHTMLElement(element: Element): element is HTMLElement {
  return 'style' in element;
}

function padScrollbar(element: HTMLElement, padding: number, rtl: boolean) {
  const styles = window.getComputedStyle(element);
  const property = rtl ? 'padding-left' : 'padding-right';
  const computedValue = rtl ? styles.paddingLeft : styles.paddingRight;
  const originalValue = element.style.getPropertyValue(property);

  element.style.setProperty(property, `${(parseInt(computedValue) || 0) + padding}px`);

  return () => {
    if (originalValue) {
      element.style.setProperty(property, originalValue);
    } else {
      element.style.removeProperty(property);
    }
  };
}

export function NoScroll({ noScroll: { disabled }, children }: LightBoxComponentProps) {
  const rtl = useRtl();
  const { getOwnerDocument, getOwnerWindow } = useDocumentContext();

  React.useEffect(() => {
    if (disabled) return () => {};

    const cleanup: (() => void)[] = [];

    const ownerWindow = getOwnerWindow();
    const { body, documentElement } = getOwnerDocument();

    const scrollbar = Math.round(ownerWindow.innerWidth - documentElement.clientWidth);
    if (scrollbar > 0) {
      cleanup.push(padScrollbar(body, scrollbar, rtl));

      const elements = body.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i];
        if (
          element &&
          isHTMLElement(element) &&
          ownerWindow.getComputedStyle(element).getPropertyValue('position') === 'fixed' &&
          !element.classList.contains(noScrollPadding)
        ) {
          cleanup.push(padScrollbar(element, scrollbar, rtl));
        }
      }
    }

    body.classList.add(noScroll);

    return () => {
      body.classList.remove(noScroll);

      cleanup.forEach((clean) => clean());
    };
  }, [rtl, disabled, getOwnerDocument, getOwnerWindow]);

  return <>{children}</>;
}

export const NoScrollModule = createModule(MODULE_NO_SCROLL, NoScroll);
