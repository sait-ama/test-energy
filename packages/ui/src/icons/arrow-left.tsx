import { createSvgIcon } from '../utils/create-svg-icon';

export const ArrowLeftIcon = createSvgIcon(
  'ArrowLeft',

  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit={10}
    strokeWidth={1.5}
    d="M6.383 12.047 2.336 8l4.047-4.046M13.668 8H2.448"
  />,
  { viewBox: '0 0 16 16' }
);

export default ArrowLeftIcon;
