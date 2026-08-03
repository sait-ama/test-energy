import { createSvgIcon } from '../utils/create-svg-icon';

export const PlayIcon = createSvgIcon(
  'Play',
  <path
    d="M3.33594 10V7.03335C3.33594 3.35001 5.94427 1.84168 9.13594 3.68335L11.7109 5.16668L14.2859 6.65001C17.4776 8.49168 17.4776 11.5083 14.2859 13.35L11.7109 14.8333L9.13594 16.3167C5.94427 18.1583 3.33594 16.65 3.33594 12.9667V10Z"
    strokeWidth="1.5"
    strokeMiterlimit="10"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  {
    viewBox: '0 0 20 20',
    stroke: 'currentColor',
    fill: 'none',
  }
);

export default PlayIcon;
