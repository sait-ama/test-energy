import { createSvgIcon } from '../utils/create-svg-icon';

export const ChevronLeftIcon = createSvgIcon(
  'ArrowLeft',

  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M9 3.833 5.667 8 9 12.167"
  />,
  {
    viewBox: '0 0 16 16',
  }
);

export default ChevronLeftIcon;
