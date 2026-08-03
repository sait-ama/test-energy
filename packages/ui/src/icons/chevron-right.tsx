import { createSvgIcon } from '../utils/create-svg-icon';

export const ChevronRightIcon = createSvgIcon(
  'ChevronRight',
  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M7 12.166 10.333 8 7 3.833"
  />,
  {
    viewBox: '0 0 16 16',
  }
);

export default ChevronRightIcon;
