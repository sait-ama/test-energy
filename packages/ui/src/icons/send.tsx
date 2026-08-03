import { createSvgIcon } from '../utils/create-svg-icon';

export const SendIcon = createSvgIcon(
  'Send',
  <>
    <path
      d="M5.66641 6.7668L12.7414 4.40846C15.9164 3.35013 17.6414 5.08346 16.5914 8.25846L14.2331 15.3335C12.6497 20.0918 10.0497 20.0918 8.46641 15.3335L7.76641 13.2335L5.66641 12.5335C0.908073 10.9501 0.908073 8.35846 5.66641 6.7668Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.9248 12.875L10.9081 9.8833"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  { fill: 'none', stroke: 'white', viewBox: '0 0 20 20' }
);

export default SendIcon;
