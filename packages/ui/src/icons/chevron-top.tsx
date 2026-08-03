import { createSvgIcon } from '../utils/create-svg-icon';

export const ChevronTopIcon = createSvgIcon(
  'ChevronTop',
  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M12.332 9.666 8.165 6.333 4 9.666"
  />,
  { viewBox: '0 0 16 16' }
);

export default ChevronTopIcon;
