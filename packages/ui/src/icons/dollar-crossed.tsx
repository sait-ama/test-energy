import { createSvgIcon } from '../utils/create-svg-icon';

export const DollarCrossedIcon = createSvgIcon(
  'dollar-crossed',
  <>
    <path
      d="M5 9.75C5 10.9957 5.89055 12 6.997 12H9.25487C10.2174 12 11 11.1212 11 10.0397C11 8.86159 10.5232 8.44635 9.81259 8.17597L6.18741 6.82403C5.47676 6.55365 5 6.13841 5 4.9603C5 3.87876 5.78261 3 6.74513 3H9.003C10.1094 3 11 4.00429 11 5.25"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 2V13" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M3 3L12.4853 12.4853"
      stroke="#C23232"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    width: '16',
    height: '16',
  }
);

export default DollarCrossedIcon;
