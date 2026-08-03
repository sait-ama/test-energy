import { createSvgIcon } from '../utils/create-svg-icon';

export const ArrowDownIcon = createSvgIcon(
  'ArrowBottom',
  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit={10}
    strokeWidth={1.5}
    d="m4.121 6.45 4.117-3.975 3.975 4.116M8.04 13.807l.195-11.219"
  />,
  { viewBox: '0 0 16 16' }
);

export default ArrowDownIcon;
