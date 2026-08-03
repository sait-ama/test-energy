import type { MouseEventHandler, SyntheticEvent } from 'react';

import { logger } from '~shared/lib/logger';

export const preventDefault: MouseEventHandler<HTMLElement> = (e) => {
  e.preventDefault();
};

enum Actions {
  DEFAULT,
  PROPAGATION,
  IMMEDIATE_PROPAGATION,
}

export class SytheticEventPreventer {
  actions: Set<Actions>;

  constructor() {
    this.actions = new Set();
    this.process = this.process.bind(this);
  }

  default() {
    this.actions.add(Actions.DEFAULT);

    return this;
  }
  propagation() {
    this.actions.add(Actions.PROPAGATION);

    return this;
  }
  immediatePropagation() {
    this.actions.add(Actions.IMMEDIATE_PROPAGATION);

    return this;
  }

  process(event: SyntheticEvent) {
    if (!event) {
      this.warn();
      return;
    }

    if (this.actions.has(Actions.DEFAULT)) {
      event.preventDefault();
    }
    if (this.actions.has(Actions.PROPAGATION)) {
      event.stopPropagation();
    }
    if (this.actions.has(Actions.IMMEDIATE_PROPAGATION)) {
      event.nativeEvent.stopImmediatePropagation();
    }
  }

  private warn() {
    logger.error('SytheticEventPreventer: no event', { scope: ['local'] });
  }
}
