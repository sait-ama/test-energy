import { createSvgIcon } from '../utils/create-svg-icon';

export const EyeIcon = createSvgIcon(
  'eye',
  <>
    <path
      d="M13 10C13 11.6604 11.6604 13 10 13C8.33962 13 7 11.6604 7 10C7 8.33962 8.33962 7 10 7C11.6604 7 13 8.33962 13 10Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 17C13.45 17 16.63 14.872 18.67 11.2507C19.11 10.476 19.11 9.524 18.67 8.74934C16.63 5.128 13.45 3 10 3C6.54999 3 3.37 5.128 1.33 8.74934C0.89 9.524 0.89 10.476 1.33 11.2507C3.37 14.872 6.54999 17 10 17Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default EyeIcon;
