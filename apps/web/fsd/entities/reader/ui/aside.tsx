import type { ReactNode } from 'react';
import * as React from 'react';

import { Slot } from '@re/ui-kit/ui/slot';

import type { CHAPTER_ASIDE } from '~entities/chapter/model/store';
import { useChapterAside } from '~entities/chapter/model/store';
import { useReader } from '~entities/reader/model/store';

interface AsideTrigger {
  children: ReactNode;
  value: CHAPTER_ASIDE;
}

export const AsideTrigger = (props: AsideTrigger) => {
  const { children, value } = props;
  const { toggle } = useChapterAside();
  const autoScrollFunc = useReader((v) => v.autoScrollFunc);

  const handleClick = () => {
    if (autoScrollFunc) autoScrollFunc(false);
    toggle({ state: value });
  };

  return <Slot onClick={handleClick}>{children}</Slot>;
};
