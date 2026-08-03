import { createSvgIcon } from '../utils/create-svg-icon';

export const PauseIcon = createSvgIcon(
  'pause',
  <>
    <path
      d="M9.375 16.425V4.575C9.375 3.45 8.9 3 7.7 3H4.675C3.475 3 3 3.45 3 4.575V16.425C3 17.55 3.475 18 4.675 18H7.7C8.9 18 9.375 17.55 9.375 16.425Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 16.425V4.575C18 3.45 17.525 3 16.325 3H13.3C12.1083 3 11.625 3.45 11.625 4.575V16.425C11.625 17.55 12.1 18 13.3 18H16.325C17.525 18 18 17.55 18 16.425Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 21 21',
    fill: 'none',
  }
);

export default PauseIcon;
