import * as React from 'react';

import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import ChevronRight from '@re/ui-kit/icons/chevron-right';
import Close from '@re/ui-kit/icons/close';
import { createSvgIcon } from '@re/ui-kit/utils/create-svg-icon';

export function createIcon(name: string, glyph: React.ReactNode) {
  return createSvgIcon(name, glyph, { viewBox: '0 0 24 24' });
}

export function createIconDisabled(name: string, glyph: React.ReactNode) {
  return createSvgIcon(
    name,
    <>
      <defs>
        <mask id="strike">
          <path d="M0 0h24v24H0z" fill="white" />
          <path d="M0 0L24 24" stroke="black" strokeWidth={4} />
        </mask>
      </defs>
      <path d="M0.70707 2.121320L21.878680 23.292883" stroke="currentColor" strokeWidth={2} />
      <g fill="currentColor" mask="url(#strike)">
        <path d="M0 0h24v24H0z" fill="none" />
        {glyph}
      </g>
    </>
  );
}

export const CloseIcon = Close;

export const PreviousIcon = ChevronLeft;
export const NextIcon = ChevronRight;

export const ErrorIcon = createIcon(
  'Error',
  <path d="M21.9,21.9l-8.49-8.49l0,0L3.59,3.59l0,0L2.1,2.1L0.69,3.51L3,5.83V19c0,1.1,0.9,2,2,2h13.17l2.31,2.31L21.9,21.9z M5,18 l3.5-4.5l2.5,3.01L12.17,15l3,3H5z M21,18.17L5.83,3H19c1.1,0,2,0.9,2,2V18.17z" />
);
