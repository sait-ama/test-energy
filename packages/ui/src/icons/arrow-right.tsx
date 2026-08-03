import { createSvgIcon } from '../utils/create-svg-icon';

export const ArrowRightIcon = createSvgIcon(
  'ArrowRight',

  <path
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit={10}
    strokeWidth={1.5}
    d="M9.617 3.953 13.664 8l-4.047 4.046M2.332 8h11.22"
  />,
  { viewBox: '0 0 16 16', stroke: 'currentColor' }
);

export default ArrowRightIcon;
