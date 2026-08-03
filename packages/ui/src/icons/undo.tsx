import { createSvgIcon } from '../utils/create-svg-icon';

export const UndoIcon = createSvgIcon(
  'Link',
  <>
    <path
      d="M5.94141 15.2581H12.6081C14.9081 15.2581 16.7747 13.3915 16.7747 11.0915C16.7747 8.79147 14.9081 6.9248 12.6081 6.9248H3.44141"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.35794 9.00788L3.22461 6.87454L5.35794 4.74121"
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

export default UndoIcon;
