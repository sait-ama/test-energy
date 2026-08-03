import { useLightboxState } from '~shared/lib/lightbox/stores/lightbox-state';

import { createModule } from '../../../config';
import { MODULE_CONTROLLER, PLUGIN_COUNTER } from '../../../consts';
import type { LightBoxComponentProps, PluginProps } from '../../../types';
import { clsx, cssClass } from '../../../utils';
import { resolveCounterProps } from './props';

export function CounterComponent({ counter }: LightBoxComponentProps) {
  const { slides, currentIndex } = useLightboxState();

  const {
    separator,
    container: { className, ...rest },
    // TODO v4: remove legacy configuration options
    className: legacyClassName,
    ...legacyRest
  } = resolveCounterProps(counter);

  if (slides.length === 0) return null;

  return (
    <div
      className={clsx(cssClass('counter'), className || legacyClassName)}
      {...legacyRest}
      {...rest}
    >
      {currentIndex + 1} {separator} {slides.length}
    </div>
  );
}

/** Counter plugin */
export function Counter({ augment, addChild }: PluginProps) {
  augment(({ counter, ...restProps }) => ({
    counter: resolveCounterProps(counter),
    ...restProps,
  }));

  addChild(MODULE_CONTROLLER, createModule(PLUGIN_COUNTER, CounterComponent));
}
