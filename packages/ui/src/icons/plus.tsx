import { createSvgIcon } from '../utils/create-svg-icon';

export const PlusIcon = createSvgIcon(
  'plus',
  <>
    <path
      d="M3 6.5H9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 9.5V3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 12 13',
    fill: 'none',
  }
);

export default PlusIcon;
