import { createSvgIcon } from '../utils/create-svg-icon';

export const CodeIcon = createSvgIcon(
  'Bold',
  <>
    <path
      d="M6.5 8.5L3 12L6.5 15.5"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 8L10.5 16"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 8.5L21 12L17.5 15.5"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default CodeIcon;
