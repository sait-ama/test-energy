import { createSvgIcon } from '../utils/create-svg-icon';

export const RedoIcon = createSvgIcon(
  'Redo',
  <>
    <path
      d="M14.0579 15.2581H7.39128C5.09128 15.2581 3.22461 13.3915 3.22461 11.0915C3.22461 8.79147 5.09128 6.9248 7.39128 6.9248H16.5579"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6426 9.00788L16.7759 6.87454L14.6426 4.74121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    stroke: 'currentColor',
    fill: 'none',
    viewBox: '0 0 20 20',
  }
);

export default RedoIcon;
