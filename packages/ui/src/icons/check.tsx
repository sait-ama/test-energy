import { createSvgIcon } from '../utils/create-svg-icon';

export const CheckIcon = createSvgIcon(
  'Check',
  <>
    <path d="M20 6 9 17l-5-5" />
  </>,
  {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
);

export default CheckIcon;
