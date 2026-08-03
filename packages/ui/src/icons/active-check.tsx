import { createSvgIcon } from '../utils/create-svg-icon';

export const ActiveCheckIcon = createSvgIcon(
  'active-check',
  <>
    <path
      d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
      fill="#3C83F6"
      stroke="#3C83F6"
      strokeWidth="1.25"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83594 9.16687L7.73695 10.8146C8.06057 11.0951 8.56338 11.0521 8.83069 10.7211L11.8359 7"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default ActiveCheckIcon;
