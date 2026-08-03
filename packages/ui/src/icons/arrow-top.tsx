import { createSvgIcon } from '../utils/create-svg-icon';

export const ArrowTopIcon = createSvgIcon(
  'ArrowTop',
  <path
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit={10}
    strokeWidth={1.5}
    d="M12.047 9.62 8 13.667 3.954 9.62M8 2.333v11.22"
  />,
  { viewBox: '0 0 16 16' }
);

export default ArrowTopIcon;
