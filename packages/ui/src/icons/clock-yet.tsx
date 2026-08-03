import { createSvgIcon } from '../utils/create-svg-icon';

export const YetClock = createSvgIcon(
  'yet-clock',
  <>
    <path
      d="M13.8334 8.83333C13.8334 12.0533 11.2201 14.6667 8.00008 14.6667C4.78008 14.6667 2.16675 12.0533 2.16675 8.83333C2.16675 5.61333 4.78008 3 8.00008 3C11.2201 3 13.8334 5.61333 13.8334 8.83333Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 5.33398V8.66732"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 1.33398H10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default YetClock;
