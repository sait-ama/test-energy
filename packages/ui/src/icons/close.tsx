import { createSvgIcon } from '../utils/create-svg-icon';

export const CloseIcon = createSvgIcon(
  'Close',
  <>
    <path d="M6 14L14 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 14L6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  {
    stroke: 'currentColor',
    fill: 'none',
    viewBox: '0 0 20 20',
  }
);

export default CloseIcon;
