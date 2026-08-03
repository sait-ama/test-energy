import { createSvgIcon } from '../utils/create-svg-icon';

export const ClockGreenIcon = createSvgIcon(
  'clock-green',
  <>
    <path
      d="M14.6667 8.00065C14.6667 11.6807 11.68 14.6673 8.00004 14.6673C4.32004 14.6673 1.33337 11.6807 1.33337 8.00065C1.33337 4.32065 4.32004 1.33398 8.00004 1.33398C11.68 1.33398 14.6667 4.32065 14.6667 8.00065Z"
      stroke="#A3FF65"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.4733 10.1192L8.40663 8.88586C8.04663 8.67253 7.7533 8.15919 7.7533 7.73919V5.00586"
      stroke="#A3FF65"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 16 16',
    width: 16,
    height: 16,
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default ClockGreenIcon;
