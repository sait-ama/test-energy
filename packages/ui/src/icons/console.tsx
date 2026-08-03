import { createSvgIcon } from '../utils/create-svg-icon';

export const ConsoleIcon = createSvgIcon(
  'Console',
  <>
    <path
      d="M6.89062 9C7.87063 9.49 8.71063 10.23 9.32063 11.15C9.67063 11.67 9.67063 12.34 9.32063 12.86C8.71063 13.77 7.87063 14.51 6.89062 15"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13 15H17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default ConsoleIcon;
