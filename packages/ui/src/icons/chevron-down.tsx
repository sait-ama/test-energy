import { createSvgIcon } from '../utils/create-svg-icon';

export const ChevronDownIcon = createSvgIcon(
  'ChevronDown',
  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="m4 7 4.167 3.333L12.333 7"
  />,
  { viewBox: '0 0 16 16' }
);

export default ChevronDownIcon;
