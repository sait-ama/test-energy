import { createSvgIcon } from '../utils/create-svg-icon';

export const TrashIcon = createSvgIcon(
  'Trash',
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M4.167 6.667V15A3.333 3.333 0 0 0 7.5 18.333h5A3.333 3.333 0 0 0 15.833 15V6.667m-4.166 2.5v5m-3.334-5v5m5-10-1.172-1.758a1.667 1.667 0 0 0-1.386-.742h-1.55c-.557 0-1.077.278-1.386.742L6.667 4.167m6.666 0H6.667m6.666 0H17.5m-10.833 0H2.5"
  />,
  { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor' }
);

export default TrashIcon;
